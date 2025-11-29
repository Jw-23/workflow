import React, { useRef, useState } from 'react';
import { WorkflowNode, Connection, NodeType, ExecutionLog } from '../../types';
import { NodeComponent } from './NodeComponent';
import { getBezierPath, getPortPosition } from '../../utils/flowUtils';

interface Props {
  nodes: WorkflowNode[];
  edges: Connection[];
  selectedId: string | null;
  logs: ExecutionLog[];
  onMoveNode: (id: string, pos: { x: number; y: number }) => void;
  onSelect: (id: string | null) => void;
  onConnect: (source: string, target: string, type?: 'default' | 'true' | 'false') => void;
  onDeleteEdge: (id: string) => void;
}

export const Canvas: React.FC<Props> = ({ 
  nodes, edges, selectedId, logs, onMoveNode, onSelect, onConnect, onDeleteEdge 
}) => {
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tempEdge, setTempEdge] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [connectionStart, setConnectionStart] = useState<{ id: string; type?: 'true' | 'false' } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      onMoveNode(draggingNode, {
        x: e.clientX - rect.left - offset.x,
        y: e.clientY - rect.top - offset.y
      });
    }
    if (connectionStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const node = nodes.find(n => n.id === connectionStart.id);
      if (node) {
        const startPos = getPortPosition(node.position.x, node.position.y, 'output', node.type === NodeType.CONDITION, connectionStart.type);
        setTempEdge({
          x1: startPos.x,
          y1: startPos.y,
          x2: e.clientX - rect.left,
          y2: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setConnectionStart(null);
    setTempEdge(null);
  };

  const startDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelect(id);
    const node = nodes.find(n => n.id === id);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left - node.position.x,
        y: e.clientY - rect.top - node.position.y
      });
      setDraggingNode(id);
    }
  };

  const startConnect = (e: React.MouseEvent, id: string, type: 'output', condType?: 'true' | 'false') => {
    e.stopPropagation();
    setConnectionStart({ id, type: condType });
  };

  const endConnect = (e: React.MouseEvent, id: string, type: 'input') => {
    e.stopPropagation();
    if (connectionStart && connectionStart.id !== id) {
      onConnect(connectionStart.id, id, connectionStart.type || 'default');
    }
    setConnectionStart(null);
    setTempEdge(null);
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-canvas cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={() => onSelect(null)}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          
          const start = getPortPosition(source.position.x, source.position.y, 'output', source.type === NodeType.CONDITION, edge.type as any);
          const end = getPortPosition(target.position.x, target.position.y, 'input');
          
          return (
            <g key={edge.id} onClick={() => onDeleteEdge(edge.id)} className="pointer-events-auto cursor-pointer group">
              <path 
                d={getBezierPath(start.x, start.y, end.x, end.y)} 
                stroke={edge.type === 'true' ? '#22c55e' : edge.type === 'false' ? '#ef4444' : '#64748b'} 
                strokeWidth="2" 
                fill="none" 
                className="group-hover:stroke-white transition-colors"
              />
            </g>
          );
        })}
        {tempEdge && (
          <path d={getBezierPath(tempEdge.x1, tempEdge.y1, tempEdge.x2, tempEdge.y2)} stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" fill="none" />
        )}
      </svg>

      {nodes.map(node => {
        const log = logs.find(l => l.nodeId === node.id); // Latest log for this node
        return (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedId === node.id}
            onMouseDown={startDrag}
            onPortMouseDown={startConnect}
            onPortMouseUp={endConnect}
            status={log?.status}
            lastOutput={log?.output}
          />
        );
      })}
    </div>
  );
};