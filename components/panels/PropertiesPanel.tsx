import React from 'react';
import { NodeData, NodeType, Language, WorkflowNode } from '../../types';
import { TEXT } from '../../constants';
import { CodeEditor } from '../ui/CodeEditor';
import { Save } from 'lucide-react';

interface Props {
  data: NodeData | null;
  type: NodeType | null;
  onChange: (data: Partial<NodeData>) => void;
  lang: Language;
  onDelete: () => void;
  onSavePreset?: () => void;
}

export const PropertiesPanel: React.FC<Props> = ({ data, type, onChange, lang, onDelete, onSavePreset }) => {
  const t = TEXT[lang];

  if (!data || !type) {
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
        {onSavePreset && (type === NodeType.SCRIPT || type === NodeType.REQUEST) && (
            <button onClick={onSavePreset} title={t.savePreset} className="text-slate-400 hover:text-white">
                <Save size={14} />
            </button>
        )}
      </h3>
      
      <div>
        <label className="block text-xs text-slate-400 mb-1">{t.fields.label}</label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-primary outline-none"
        />
      </div>

      {type === NodeType.START && (
        <div>
           <label className="block text-xs text-slate-400 mb-1">{t.fields.initValue}</label>
           <CodeEditor
             value={data.initValue || ''}
             onChange={(v) => onChange({ initValue: v })}
             height="h-24"
             language="json"
             placeholder='{"key": "value"}'
           />
           <p className="text-[10px] text-slate-500 mt-1">{t.hints.initValue}</p>
        </div>
      )}

      {type === NodeType.REQUEST && (
        <>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.fields.url}</label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => onChange({ url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-primary outline-none"
              placeholder="https://api.example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.fields.method}</label>
            <select
              value={data.method || 'GET'}
              onChange={(e) => onChange({ method: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
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
              value={data.headers || ''}
              onChange={(v) => onChange({ headers: v })}
              height="h-24"
              language="json"
              placeholder='{"Authorization": "Bearer..."}'
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">{t.fields.body}</label>
            <CodeEditor
              value={data.body || ''}
              onChange={(v) => onChange({ body: v })}
              height="h-32"
              language="json"
              placeholder="{}"
            />
          </div>
        </>
      )}

      {type === NodeType.SCRIPT && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">{t.fields.code}</label>
          <CodeEditor
             value={data.code || ''}
             onChange={(v) => onChange({ code: v })}
             height="h-64"
          />
          <p className="text-[10px] text-slate-500 mt-1">{t.hints.code}</p>
        </div>
      )}

      {type === NodeType.CONDITION && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">{t.fields.condition}</label>
          <CodeEditor
             value={data.condition || ''}
             onChange={(v) => onChange({ condition: v })}
             height="h-24"
          />
          <p className="text-[10px] text-slate-500 mt-1">{t.hints.condition}</p>
        </div>
      )}

      {type === NodeType.DELAY && (
        <div>
           <label className="block text-xs text-slate-400 mb-1">{t.fields.delay}</label>
           <input
              type="number"
              value={data.delayMs || 1000}
              onChange={(e) => onChange({ delayMs: parseInt(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
            />
        </div>
      )}

      <div className="pt-4 mt-4 border-t border-slate-700">
        <button 
          onClick={onDelete}
          className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 text-xs py-2 rounded transition-colors"
        >
          {t.delete}
        </button>
      </div>
    </div>
  );
};