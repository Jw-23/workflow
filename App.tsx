
import React, { useState, useEffect } from 'react';
import { WorkflowNode, Connection, NodeType, Language, Workflow, ExecutionLog, NodeData } from './types';
import { TEXT, INITIAL_CODE, NODE_COLORS } from './constants';
import { generateId } from './utils/flowUtils';
import { WorkflowEngine } from './services/engine';
import { Canvas } from './components/flow/Canvas';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { Button } from './components/ui/Button';
import { Play, Save, RotateCcw, Box, Star, GitMerge } from 'lucide-react';

const App = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<Connection[]>([]);
  const [presets, setPresets] = useState<WorkflowNode[]>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  
  const [language, setLanguage] = useState<Language>('cn');
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const t = TEXT[language];

  useEffect(() => {
    const saved = localStorage.getItem('flowforge_wf');
    if (saved) {
      try {
        const wf: Workflow = JSON.parse(saved);
        setNodes(wf.nodes);
        setEdges(wf.edges);
      } catch (e) { console.error("Failed to load wf"); }
    }
    const savedPresets = localStorage.getItem('flowforge_presets');
    if (savedPresets) {
      try { setPresets(JSON.parse(savedPresets)); } catch (e) {}
    }
  }, []);

  const saveWorkflow = () => {
    const wf: Workflow = { id: 'local', name: 'My Workflow', nodes, edges, lastModified: Date.now() };
    localStorage.setItem('flowforge_wf', JSON.stringify(wf));
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    setLogs([]);
    const engine = new WorkflowEngine(nodes, edges);
    try {
      const newLogs = await engine.execute();
      setLogs(newLogs);
    } catch (e) {
      console.error(e);
      // Ensure we see errors in logs even if crash
      // engine.execute() should catch most, but top level safety:
    } finally {
      setIsRunning(false);
    }
  };

  const addNode = (type: NodeType, presetData?: any) => {
    const newNode: WorkflowNode = {
      id: generateId(),
      type,
      position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
      data: presetData ? { ...presetData } : { 
        label: t.nodeTypes[type],
        code: type === NodeType.SCRIPT ? INITIAL_CODE : undefined,
        useProxy: type === NodeType.REQUEST ? true : undefined
      }
    };
    setNodes([...nodes, newNode]);
  };

  const updateNode = (id: string, data: Partial<NodeData>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
  };
  
  const updateEdge = (id: string, data: Partial<Connection>) => {
    setEdges(edges.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteNode = () => {
    if (!selectedNodeId) return;
    setNodes(nodes.filter(n => n.id !== selectedNodeId));
    setEdges(edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const deleteEdge = () => {
    if (!selectedEdgeId) return;
    setEdges(edges.filter(e => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  };

  const savePreset = () => {
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return;
    const newPreset = { ...node, id: generateId(), position: {x:0, y:0} };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('flowforge_presets', JSON.stringify(updatedPresets));
  };

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null;
  const selectedEdge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) || null : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 font-sans">
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            {t.appTitle}
          </h1>
          <div className="flex gap-1 text-xs bg-slate-700 rounded p-1">
             <button onClick={() => setLanguage('en')} className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-slate-500 text-white' : 'text-slate-400'}`}>EN</button>
             <button onClick={() => setLanguage('cn')} className={`px-2 py-0.5 rounded ${language === 'cn' ? 'bg-slate-500 text-white' : 'text-slate-400'}`}>中文</button>
          </div>
        </div>
        
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" onClick={() => { setNodes([]); setEdges([]); }} icon={<RotateCcw size={14} />}>{t.clear}</Button>
           <Button variant="secondary" size="sm" onClick={saveWorkflow} icon={<Save size={14} />}>{t.save}</Button>
           <Button variant="primary" size="sm" onClick={runWorkflow} disabled={isRunning} icon={<Play size={14} />}>
             {isRunning ? 'Running...' : t.run}
           </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-panel border-r border-border flex flex-col p-2 gap-2 z-10 overflow-y-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{t.nodes}</h2>
          {Object.values(NodeType).map(type => (
            <button key={type} onClick={() => addNode(type)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded hover:bg-slate-700 border border-slate-700 text-sm transition-all active:scale-95 text-left">
              <div className={`w-2 h-2 rounded-full ${NODE_COLORS[type].split(' ')[0]}`} />
              {t.nodeTypes[type]}
            </button>
          ))}
          
          {presets.length > 0 && (
            <>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-4 flex items-center gap-1">
                 <Star size={10} /> Custom
              </h2>
              {presets.map(p => (
                <button key={p.id} onClick={() => addNode(p.type, p.data)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded hover:bg-slate-700 border border-dashed border-slate-700 text-sm transition-all active:scale-95 text-left truncate">
                  <Box size={10} className="text-yellow-500" />
                  <span className="truncate">{p.data.label}</span>
                </button>
              ))}
            </>
          )}

          <div className="mt-auto border-t border-border pt-2">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{t.logs}</h2>
             <div className="space-y-1 px-2 pb-2 max-h-40 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => (
                   <div key={i} className={`text-[10px] font-mono p-1 rounded border ${log.status === 'error' ? 'border-red-800 bg-red-900/20 text-red-300' : 'border-green-800 bg-green-900/20 text-green-300'}`}>
                      <span className="font-bold">[{nodes.find(n => n.id === log.nodeId)?.data.label}]</span>
                      <pre className="truncate mt-0.5">{JSON.stringify(log.output)}</pre>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <Canvas 
            nodes={nodes} edges={edges} 
            selectedId={selectedNodeId} 
            selectedEdgeId={selectedEdgeId}
            logs={logs}
            onMoveNode={(id, pos) => setNodes(nodes.map(n => n.id === id ? { ...n, position: pos } : n))}
            onSelectNode={setSelectedNodeId}
            onSelectEdge={setSelectedEdgeId}
            onConnect={(src, tgt, type) => setEdges([...edges, { id: generateId(), source: src, target: tgt, type: type || 'default' }])}
          />
        </div>

        <div className="w-72 bg-panel border-l border-border z-10 overflow-y-auto">
          <PropertiesPanel 
            nodeId={selectedNodeId}
            edgeId={selectedEdgeId}
            nodeData={selectedNode?.data || null}
            nodeType={selectedNode?.type || null}
            edgeData={selectedEdge || null}
            onChangeNode={(d) => selectedNodeId && updateNode(selectedNodeId, d)}
            onChangeEdge={(d) => selectedEdgeId && updateEdge(selectedEdgeId, d)}
            lang={language}
            onDeleteNode={deleteNode}
            onDeleteEdge={deleteEdge}
            onSavePreset={savePreset}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
