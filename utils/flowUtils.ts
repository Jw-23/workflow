export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getBezierPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string => {
  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const curvature = Math.min(dist * 0.5, 150);
  
  return `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
};

export const getNodePosition = (nodeId: string, nodes: any[]) => {
  const node = nodes.find((n) => n.id === nodeId);
  return node ? node.position : { x: 0, y: 0 };
};

// Simple collision detection or specific port location logic could go here
export const getPortPosition = (
  nodeX: number,
  nodeY: number,
  type: 'input' | 'output',
  isCondition = false,
  conditionType?: 'true' | 'false'
) => {
  const width = 160; // Approximate node width
  const height = 60; // Approximate node height (header + body)

  if (type === 'input') {
    return { x: nodeX, y: nodeY + height / 2 };
  } else {
    // Output
    if (isCondition) {
      if (conditionType === 'true') return { x: nodeX + width, y: nodeY + height / 3 };
      return { x: nodeX + width, y: nodeY + (height * 2) / 3 };
    }
    return { x: nodeX + width, y: nodeY + height / 2 };
  }
};