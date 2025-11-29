
import { NodeType, WorkflowNode, Connection, ExecutionLog } from '../types';

export class WorkflowEngine {
  private nodes: Map<string, WorkflowNode>;
  private edges: Connection[];
  private logs: ExecutionLog[] = [];
  private maxSteps = 1000; // Increased for loops
  private executionCount = 0;

  constructor(nodes: WorkflowNode[], edges: Connection[]) {
    this.nodes = new Map(nodes.map(n => [n.id, n]));
    this.edges = edges;
  }

  private addLog(nodeId: string, status: 'success' | 'error', output: any, logMsg?: string) {
    this.logs.push({
      nodeId,
      status,
      output,
      timestamp: Date.now(),
      logs: logMsg ? [logMsg] : []
    });
  }

  // Core execution of a single node logic (without iteration wrapper)
  private async executeNodeLogic(node: WorkflowNode, input: any): Promise<any> {
    let output = input;

    switch (node.type) {
      case NodeType.START:
        let initVal = {};
        if (node.data.initValue) {
          try { initVal = JSON.parse(node.data.initValue); } catch { initVal = node.data.initValue; }
        }
        output = { startTime: Date.now(), ...initVal };
        break;

      case NodeType.DELAY:
        const ms = node.data.delayMs || 1000;
        await new Promise(resolve => setTimeout(resolve, ms));
        break;

      case NodeType.CLIPBOARD:
        const textToCopy = typeof input === 'object' ? JSON.stringify(input, null, 2) : String(input);
        try {
          // Note: Clipboard API requires user gesture usually. 
          // In a real execution loop without gesture, this might fail or require permissions.
          await navigator.clipboard.writeText(textToCopy);
          this.addLog(node.id, 'success', output, 'Copied to clipboard');
        } catch (e) {
          console.warn("Clipboard write failed", e);
          this.addLog(node.id, 'error', output, 'Clipboard permission denied (browser restriction)');
        }
        break;

      case NodeType.SCRIPT:
        // Safe function execution
        const safeFn = new Function('input', 'console', `return (async () => { ${node.data.code || ''} })()`);
        const logBuffer: string[] = [];
        const mockConsole = { log: (...args: any[]) => logBuffer.push(args.map(a => JSON.stringify(a)).join(' ')) };
        
        try {
          const result = await safeFn(input, mockConsole);
          output = result === undefined ? input : result;
          if (logBuffer.length > 0) this.addLog(node.id, 'success', output, logBuffer.join('\n'));
        } catch (e: any) {
          throw new Error(`Script Error: ${e.message}`);
        }
        break;

      case NodeType.REQUEST:
        const method = node.data.method || 'GET';
        const body = ['GET', 'HEAD'].includes(method) ? undefined : node.data.body;
        const headersStr = node.data.headers || '{}';
        let headers = {};
        try { headers = JSON.parse(headersStr); } catch { console.error("Invalid headers JSON"); }
        
        const url = node.data.url || '';
        let res: Response;

        if (node.data.useProxy) {
          // Use Cloudflare Pages API Proxy
          // Assumes /api/proxy endpoint exists on the server
          res = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url,
              method,
              headers: { 'Content-Type': 'application/json', ...headers },
              body: typeof body === 'string' ? body : JSON.stringify(body)
            })
          });
        } else {
          // Direct fetch
          res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            body: typeof body === 'string' ? body : JSON.stringify(body)
          });
        }

        if (!res.ok) {
           throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const text = await res.text();
        try { output = JSON.parse(text); } catch { output = text; }
        break;

      case NodeType.CONDITION:
        const checkFn = new Function('input', `return ${node.data.condition || 'false'}`);
        const isTrue = checkFn(input);
        this.addLog(node.id, 'success', { result: isTrue }, `Condition: ${isTrue}`);
        return { isConditionResult: true, value: isTrue, originalInput: input };
    }

    return output;
  }

  // Wrapper to handle iteration (Map/ForEach) or single execution
  async runNodeWrapper(nodeId: string, input: any, incomingEdge?: Connection): Promise<{ nextId: string | null; output: any }> {
    const node = this.nodes.get(nodeId);
    if (!node) return { nextId: null, output: null };

    // Handle Iteration Logic from Incoming Edge
    const isIterator = incomingEdge && (incomingEdge.iteration === 'map' || incomingEdge.iteration === 'forEach');
    
    let output: any;

    try {
      if (isIterator && Array.isArray(input)) {
        // Run logic for each item
        const results = [];
        for (const item of input) {
           // We ignore condition results in map for simplicity, or we map to booleans
           const res = await this.executeNodeLogic(node, item);
           results.push(res);
        }
        
        if (incomingEdge.iteration === 'forEach') {
          // ForEach returns the original array (pass-through) or empty? 
          // Usually forEach doesn't mutate flow data, but we pass input through.
          output = input; 
        } else {
          // Map returns new array
          output = results;
        }
        this.addLog(nodeId, 'success', output, `Iterated ${input.length} items`);
      } else {
        // Normal Execution
        output = await this.executeNodeLogic(node, input);
        if (node.type !== NodeType.CONDITION && node.type !== NodeType.CLIPBOARD) {
            this.addLog(nodeId, 'success', output);
        }
      }

      // Determine Next Node
      let nextId: string | null = null;
      
      if (node.type === NodeType.CONDITION) {
         // output is { isConditionResult: true, value: boolean, originalInput: any }
         // Condition node "Map" is tricky. If we mapped a condition, we have [true, false, true].
         // This engine currently supports branching only on Single execution.
         // If a condition receives an array via Map, it effectively outputs an array of booleans.
         // We can't branch "Half left, Half right". 
         // So we treat Condition as a filter if it was mapped? No, let's keep it simple:
         // If Condition was iterated, we just pass the results. It doesn't branch. 
         
         if (output?.isConditionResult) {
            const isTrue = output.value;
            const trueEdge = this.edges.find(e => e.source === nodeId && e.type === 'true');
            const falseEdge = this.edges.find(e => e.source === nodeId && e.type === 'false');
            nextId = isTrue ? (trueEdge?.target || null) : (falseEdge?.target || null);
            output = output.originalInput; // Pass original input to next node
         } else {
            // If condition logic returned something else (e.g. array from map), we just go default?
            // Fallback for mapped condition: proceed to 'true' edge with the array of results? 
            // Simplified: Mapped condition is just data processing.
            const defaultEdge = this.edges.find(e => e.source === nodeId && e.type === 'default');
            nextId = defaultEdge?.target || null;
         }
      } else {
        const edge = this.edges.find(e => e.source === nodeId);
        nextId = edge?.target || null;
      }

      return { nextId, output };

    } catch (err: any) {
      this.addLog(nodeId, 'error', { error: err.message });
      throw err;
    }
  }

  async execute() {
    this.logs = [];
    this.executionCount = 0;
    const startNode = Array.from(this.nodes.values()).find(n => n.type === NodeType.START);
    if (!startNode) throw new Error("No START node found.");

    let currentNodeId: string | null = startNode.id;
    let currentInput: any = {};
    let incomingEdge: Connection | undefined = undefined;

    while (currentNodeId && this.executionCount < this.maxSteps) {
      const result = await this.runNodeWrapper(currentNodeId, currentInput, incomingEdge);
      currentInput = result.output;
      
      const nextId = result.nextId;
      if (nextId) {
        // Find the edge that connects current to next to determine iteration mode for next step
        incomingEdge = this.edges.find(e => e.source === currentNodeId && e.target === nextId);
      } else {
        incomingEdge = undefined;
      }

      currentNodeId = nextId;
      this.executionCount++;
    }
    
    return this.logs;
  }
}
