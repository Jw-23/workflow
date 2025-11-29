import { NodeType, WorkflowNode, Connection, ExecutionLog } from '../types';

export class WorkflowEngine {
  private nodes: Map<string, WorkflowNode>;
  private edges: Connection[];
  private logs: ExecutionLog[] = [];
  private maxSteps = 100;

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

  async runNode(nodeId: string, input: any): Promise<{ nextId: string | null; output: any }> {
    const node = this.nodes.get(nodeId);
    if (!node) return { nextId: null, output: null };

    try {
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
          // Try to copy. Note: This might fail if the browser enforces user interaction strictly.
          try {
            await navigator.clipboard.writeText(textToCopy);
            this.addLog(nodeId, 'success', output, 'Copied to clipboard');
          } catch (e) {
            console.warn("Clipboard write failed", e);
            this.addLog(nodeId, 'error', output, 'Clipboard permission denied (browser restriction)');
          }
          break;

        case NodeType.SCRIPT:
          const safeFn = new Function('input', 'console', `return (async () => { ${node.data.code || ''} })()`);
          const logBuffer: string[] = [];
          const mockConsole = { log: (...args: any[]) => logBuffer.push(args.map(a => JSON.stringify(a)).join(' ')) };
          const result = await safeFn(input, mockConsole);
          output = result === undefined ? input : result; // If no return, pass input? Or undefined. Usually pass input if void.
          if (logBuffer.length > 0) this.addLog(nodeId, 'success', output, logBuffer.join('\n'));
          break;

        case NodeType.REQUEST:
          const method = node.data.method || 'GET';
          const body = ['GET', 'HEAD'].includes(method) ? undefined : node.data.body;
          const headersStr = node.data.headers || '{}';
          let headers = {};
          try { headers = JSON.parse(headersStr); } catch { console.error("Invalid headers JSON"); }
          
          const res = await fetch(node.data.url || '', {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            body: body
          });
          const text = await res.text();
          try { output = JSON.parse(text); } catch { output = text; }
          break;

        case NodeType.CONDITION:
          const checkFn = new Function('input', `return ${node.data.condition || 'false'}`);
          const isTrue = checkFn(input);
          this.addLog(nodeId, 'success', { result: isTrue }, `Condition: ${isTrue}`);
          const trueEdge = this.edges.find(e => e.source === nodeId && e.type === 'true');
          const falseEdge = this.edges.find(e => e.source === nodeId && e.type === 'false');
          return {
            nextId: isTrue ? (trueEdge?.target || null) : (falseEdge?.target || null),
            output: input
          };
      }

      this.addLog(nodeId, 'success', output);
      
      const edge = this.edges.find(e => e.source === nodeId);
      return { nextId: edge?.target || null, output };

    } catch (err: any) {
      this.addLog(nodeId, 'error', { error: err.message });
      throw err;
    }
  }

  async execute() {
    this.logs = [];
    const startNode = Array.from(this.nodes.values()).find(n => n.type === NodeType.START);
    if (!startNode) throw new Error("No START node found.");

    let currentNodeId: string | null = startNode.id;
    let currentInput: any = {};
    let steps = 0;

    while (currentNodeId && steps < this.maxSteps) {
      const result = await this.runNode(currentNodeId, currentInput);
      currentInput = result.output;
      currentNodeId = result.nextId;
      steps++;
    }
    
    return this.logs;
  }
}