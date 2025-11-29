
import React from 'react';
import { NodeData, NodeType, Language, WorkflowNode, Connection, IterationType } from '../../types';
import { TEXT } from '../../constants';
import { CodeEditor } from '../ui/CodeEditor';
import { Save, Trash2 } from 'lucide-react';

interface Props {
  nodeId: string | null;
  edgeId: string | null;
  nodeData: NodeData | null;
  nodeType: NodeType | null;
  edgeData: Connection | null;
  onChangeNode: (data: Partial<NodeData>) => void;
  onChangeEdge: (data: Partial<Connection>) => void;
  lang: Language;
  onDeleteNode: () => void;
  onDeleteEdge: () => void;
  onSavePreset?: () => void;
}

export const PropertiesPanel: React.FC<Props> = ({ 
  nodeId, edgeId, nodeData, nodeType, edgeData, 
  onChangeNode, onChangeEdge, lang, 
  onDeleteNode, onDeleteEdge, onSavePreset 
}) => {
  const t = TEXT[lang];

  if (edgeId && edgeData) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-bold text-slate-200 border-b border-slate-700 pb-2 mb-4">
          Connection Properties
        </h3>
        <div>
           <label className="block text-xs text-slate-400 mb-1">{t.fields.iteration}</label>
           <select 
             value={edgeData.iteration || 'default'}
             onChange={(e) => onChangeEdge({ iteration: e.target.value as IterationType })}
             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
           >
             <option value="default">{t.iterationTypes.default}</option>
             <option value="map">{t.iterationTypes.map}</option>
             <option value="forEach">{t.iterationTypes.forEach}</option>
           </select>
           <p className="text-[10px] text-slate-500 mt-2">
             {edgeData.iteration === 'map' ? 
               "Target node runs for EACH item in array. Returns Array." :
               edgeData.iteration === 'forEach' ? 
               "Target node runs for EACH item. Returns original Array." :
               "Standard single execution flow."
             }
           </p>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-700">
          <button 
            onClick={onDeleteEdge}
            className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-200 text-xs py-2 rounded transition-colors"
          >
            <Trash2 size={12} /> {t.delete}
          </button>
        </div>
      </div>
    );
  }

  if (!nodeData || !nodeType) {
    return (
      <div className="p-4 text-slate-500 text-sm text-center">
        {t.noNodeSelected}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-slate-200 border-b border-slate-700 pb-2 mb-4 flex justify-between items-center">
        {t.properties}
        {onSavePreset && (nodeType === NodeType.SCRIPT || nodeType === NodeType.REQUEST) && (
            <button onClick={onSavePreset} title={t.savePreset} className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded">
                <Save size={14} />
            </button>
        )}
      </h3>
      
      <div>
        <label className="block text-xs text-slate-400 mb-1">{t.fields.label}</label>
        <input
          type="text"
          value={nodeData.label}
          onChange={(e) => onChangeNode({ label: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-primary outline-none text-slate-200"
        />
      </div>

      {nodeType === NodeType.START && (
        <div>
           <label className="block text-xs text-slate-400 mb-1">{t.fields.initValue}</label>
           <CodeEditor
             value={nodeData.initValue || ''}
             onChange={(v) => onChangeNode({ initValue: v })}
             height="h-24"
             language="json"
             placeholder='{"key": "value"}'
           />
           <p className="text-[10px] text-slate-500 mt-1">{t.hints.initValue}</p>
        </div>
      )}

      {nodeType === NodeType.REQUEST && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="useProxy"
              checked={nodeData.useProxy || false}
              onChange={(e) => onChangeNode({ useProxy: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700"
            />
            <label htmlFor="useProxy" className="text-xs text-slate-300">{t.fields.useProxy}</label>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.fields.url}</label>
            <input
              type="text"
              value={nodeData.url || ''}
              onChange={(e) => onChangeNode({ url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-primary outline-none text-slate-200"
              placeholder="https://api.example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.fields.method}</label>
            <select
              value={nodeData.method || 'GET'}
              onChange={(e) => onChangeNode({ method: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </div>
           <div>
            <label className="block text-xs text-slate-400 mb-1">{t.fields.headers}</label>
            <CodeEditor
              value={nodeData.headers || ''}
              onChange={(v) => onChangeNode({ headers: v })}
              height="h-24"
              language="json"
              placeholder='{"Authorization": "Bearer..."}'
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.fields.body}</label>
            <CodeEditor
              value={nodeData.body || ''}
              onChange={(v) => onChangeNode({ body: v })}
              height="h-32"
              language="json"
              placeholder="{}"
            />
          </div>
        </>
      )}

      {nodeType === NodeType.SCRIPT && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">{t.fields.code}</label>
          <CodeEditor
             value={nodeData.code || ''}
             onChange={(v) => onChangeNode({ code: v })}
             height="h-64"
          />
          <p className="text-[10px] text-slate-500 mt-1">{t.hints.code}</p>
        </div>
      )}

      {nodeType === NodeType.CONDITION && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">{t.fields.condition}</label>
          <CodeEditor
             value={nodeData.condition || ''}
             onChange={(v) => onChangeNode({ condition: v })}
             height="h-24"
          />
          <p className="text-[10px] text-slate-500 mt-1">{t.hints.condition}</p>
        </div>
      )}

      {nodeType === NodeType.DELAY && (
        <div>
           <label className="block text-xs text-slate-400 mb-1">{t.fields.delay}</label>
           <input
              type="number"
              value={nodeData.delayMs || 1000}
              onChange={(e) => onChangeNode({ delayMs: parseInt(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
            />
        </div>
      )}

      <div className="pt-4 mt-4 border-t border-slate-700">
        <button 
          onClick={onDeleteNode}
          className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-200 text-xs py-2 rounded transition-colors"
        >
          <Trash2 size={12} /> {t.delete}
        </button>
      </div>
    </div>
  );
};
