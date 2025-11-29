export enum NodeType {
  START = 'START',
  END = 'END',
  REQUEST = 'REQUEST',
  SCRIPT = 'SCRIPT',
  CONDITION = 'CONDITION',
  DELAY = 'DELAY',
  CLIPBOARD = 'CLIPBOARD'
}

export interface NodeData {
  label: string;
  initValue?: string; // For START (JSON string)
  code?: string; // For SCRIPT
  url?: string; // For REQUEST
  method?: string; // For REQUEST
  headers?: string; // For REQUEST (JSON string)
  body?: string; // For REQUEST
  condition?: string; // For CONDITION (JS expression)
  delayMs?: number; // For DELAY
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'true' | 'false'; // For conditions
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: Connection[];
  lastModified: number;
}

export interface ExecutionLog {
  nodeId: string;
  status: 'pending' | 'success' | 'error';
  output: any;
  timestamp: number;
  logs: string[];
}

export type Language = 'en' | 'cn';

export interface WorkflowContextType {
  nodes: WorkflowNode[];
  edges: Connection[];
  selectedNodeId: string | null;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  addEdge: (source: string, target: string, type?: 'default' | 'true' | 'false') => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  setWorkflow: (workflow: Workflow) => void;
  getWorkflow: () => Workflow;
  language: Language;
  setLanguage: (lang: Language) => void;
}