import React from 'react';
import { NodeType, WorkflowNode } from '../../types';
import { NODE_COLORS } from '../../constants';
import { Settings, Play, CheckCircle, AlertTriangle, Clipboard } from 'lucide-react';

interface Props {
  node: WorkflowNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onPortMouseDown: (e: React.MouseEvent, id: string, type: 'output', conditionType?: 'true' | 'false') => void;
  onPortMouseUp: (e: React.MouseEvent, id: string, type: 'input') => void;
  status?: 'pending' | 'success' | 'error';
  lastOutput?: any;
}

export const NodeComponent: React.FC<Props> = ({ 
  node, isSelected, onMouseDown, onPortMouseDown, onPortMouseUp, status, lastOutput 
}) => {
  const colorClass = NODE_COLORS[node.type] || "bg-slate-600";
  const isCondition = node.type === NodeType.CONDITION;

  return (
    <div
      className={`absolute w-40 rounded shadow-lg select-none group transition-transform
        ${isSelected ? 'ring-2 ring-white z-10' : 'z-0'}
        ${status === 'success' ? 'ring-2 ring-green-500' : ''}
        ${status === 'error' ? 'ring-2 ring-red-500' : ''}
      `}
      style={{ left: node.position.x, top: node.position.y }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >
      <div className={`h-8 px-3 flex items-center justify-between rounded-t ${colorClass}`}>
        <span className="text-xs font-bold text-white truncate max-w-[120px]">{node.data.label}</span>
        {node.type === NodeType.CLIPBOARD && <Clipboard size={12} className="text-white opacity-80" />}
        <Settings size={12} className="text-white opacity-50 group-hover:opacity-100" />
      </div>

      <div className="bg-slate-800 p-2 rounded-b text-xs text-slate-300 min-h-[40px] flex items-center justify-center relative">
         <div className="truncate px-1">{node.type}</div>
         
         {/* Display END Value */}
         {node.type === NodeType.END && lastOutput !== undefined && (
           <div className="absolute top-full mt-1 left-0 w-full bg-slate-900/90 backdrop-blur p-2 rounded border border-slate-700 text-[10px] z-20 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="text-slate-500 mb-1 font-bold">Output:</div>
             <pre className="text-green-400 overflow-x-auto max-h-20 scrollbar-thin scrollbar-thumb-slate-700">
               {typeof lastOutput === 'object' ? JSON.stringify(lastOutput, null, 2) : String(lastOutput)}
             </pre>
           </div>
         )}
      </div>

      {node.type !== NodeType.START && (
        <div 
          className="absolute -left-3 top-8 w-6 h-6 flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform"
          onMouseUp={(e) => onPortMouseUp(e, node.id, 'input')}
        >
          <div className="w-3 h-3 bg-slate-400 rounded-full hover:bg-white border-2 border-slate-800" />
        </div>
      )}

      {node.type !== NodeType.END && !isCondition && (
        <div 
          className="absolute -right-3 top-8 w-6 h-6 flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform"
          onMouseDown={(e) => onPortMouseDown(e, node.id, 'output')}
        >
           <div className="w-3 h-3 bg-slate-400 rounded-full hover:bg-white border-2 border-slate-800" />
        </div>
      )}

      {isCondition && (
        <>
          <div 
            className="absolute -right-3 top-4 w-6 h-6 flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => onPortMouseDown(e, node.id, 'output', 'true')}
            title="True"
          >
             <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-300 border-2 border-slate-800" />
          </div>
          <div 
            className="absolute -right-3 top-12 w-6 h-6 flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => onPortMouseDown(e, node.id, 'output', 'false')}
            title="False"
          >
             <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-300 border-2 border-slate-800" />
          </div>
        </>
      )}
    </div>
  );
};