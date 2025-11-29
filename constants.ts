
import { NodeType } from "./types";

export const TEXT = {
  en: {
    appTitle: "FlowForge",
    run: "Run",
    save: "Save",
    load: "Load",
    clear: "Clear",
    nodes: "Node Library",
    properties: "Properties",
    logs: "Logs",
    delete: "Delete",
    savePreset: "Save as Preset",
    noNodeSelected: "Select a node or connection",
    nodeTypes: {
      [NodeType.START]: "Start",
      [NodeType.END]: "End",
      [NodeType.REQUEST]: "HTTP Request",
      [NodeType.SCRIPT]: "JS Script",
      [NodeType.CONDITION]: "If / Else",
      [NodeType.DELAY]: "Delay",
      [NodeType.CLIPBOARD]: "Clipboard",
    },
    fields: {
      label: "Label",
      initValue: "Initial Value (JSON)",
      url: "URL",
      method: "Method",
      headers: "Headers (JSON)",
      body: "Body (JSON)",
      useProxy: "Use Cloudflare Proxy",
      code: "JavaScript Code",
      condition: "Condition (JS)",
      delay: "Delay (ms)",
      iteration: "Flow Mode"
    },
    iterationTypes: {
      default: "Direct Pass",
      map: "Map (Array -> Item)",
      forEach: "ForEach (No Return)"
    },
    hints: {
      code: "Vars: input, context. Return value -> next node.",
      condition: "Vars: input. Return boolean.",
      initValue: "JSON object, string, or number",
      proxy: "Enable to bypass CORS using /api/proxy"
    }
  },
  cn: {
    appTitle: "FlowForge 工作流",
    run: "运行",
    save: "保存",
    load: "加载",
    clear: "清空",
    nodes: "节点库",
    properties: "属性面板",
    logs: "日志",
    delete: "删除",
    savePreset: "保存为自定义节点",
    noNodeSelected: "请选择一个节点或连线",
    nodeTypes: {
      [NodeType.START]: "开始",
      [NodeType.END]: "结束",
      [NodeType.REQUEST]: "网络请求",
      [NodeType.SCRIPT]: "JS 脚本",
      [NodeType.CONDITION]: "条件判断",
      [NodeType.DELAY]: "延时",
      [NodeType.CLIPBOARD]: "剪切板",
    },
    fields: {
      label: "标签",
      initValue: "初始值 (JSON)",
      url: "请求地址",
      method: "请求方法",
      headers: "请求头 (JSON)",
      body: "请求体 (JSON)",
      useProxy: "使用 Cloudflare 代理",
      code: "JS 代码",
      condition: "条件表达式",
      delay: "延时 (ms)",
      iteration: "流转模式"
    },
    iterationTypes: {
      default: "直接传递",
      map: "Map 迭代 (Array -> Item)",
      forEach: "ForEach 遍历 (无返回)"
    },
    hints: {
      code: "变量: input, context。返回值传给下个节点。",
      condition: "变量: input。返回布尔值。",
      initValue: "JSON 对象、字符串或数字",
      proxy: "开启以通过 /api/proxy 绕过跨域限制"
    }
  }
};

export const INITIAL_CODE = `// Custom Logic
// input: previous node output
const val = input?.value || 0;
return { value: val + 1 };
`;

export const NODE_COLORS: Record<NodeType, string> = {
  [NodeType.START]: "bg-green-600 border-green-400",
  [NodeType.END]: "bg-red-600 border-red-400",
  [NodeType.REQUEST]: "bg-blue-600 border-blue-400",
  [NodeType.SCRIPT]: "bg-yellow-600 border-yellow-400",
  [NodeType.CONDITION]: "bg-purple-600 border-purple-400",
  [NodeType.DELAY]: "bg-gray-600 border-gray-400",
  [NodeType.CLIPBOARD]: "bg-cyan-600 border-cyan-400",
};
