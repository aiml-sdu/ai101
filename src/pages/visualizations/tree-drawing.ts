import { drawCircle, drawLine, drawText, getThemeColors } from '../../visualizations/canvas-utils.ts';

// ---- Color constants ----
export const COL_UNSEEN = '#9ca3af';
export const COL_FRINGE = '#fbbf24';
export const COL_CURRENT = '#ef4444';
export const COL_EXPLORED = '#22c55e';
export const COL_GOAL = '#3b82f6';
export const COL_PATH = '#8b5cf6';

// ---- Tree data ----

export interface TreeNode {
  id: string;
  x: number;
  y: number;
  children: string[];
}

export const TREE_NODES: Record<string, TreeNode> = {
  A: { id: 'A', x: 350, y: 40, children: ['B', 'C'] },
  B: { id: 'B', x: 175, y: 130, children: ['D', 'E'] },
  C: { id: 'C', x: 525, y: 130, children: ['F', 'G'] },
  D: { id: 'D', x: 100, y: 220, children: [] },
  E: { id: 'E', x: 250, y: 220, children: [] },
  F: { id: 'F', x: 450, y: 220, children: [] },
  G: { id: 'G', x: 600, y: 220, children: [] },
};

export const TREE_GOAL = 'G';

export function getTreeNeighbors(node: string): { city: string; cost: number }[] {
  const n = TREE_NODES[node];
  if (!n) return [];
  return n.children.map((c) => ({ city: c, cost: 1 }));
}

// ---- Draw tree ----

export interface DrawTreeOptions {
  current?: string;
  explored?: Set<string>;
  fringeNodes?: Set<string>;
  goalFound?: string;
  path?: string[];
  clickable?: Set<string>;
}

export function drawTree(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: DrawTreeOptions = {},
) {
  const colors = getThemeColors();
  ctx.clearRect(0, 0, w, h);

  const pathSet = new Set(options.path ?? []);

  // Draw edges first
  for (const node of Object.values(TREE_NODES)) {
    for (const childId of node.children) {
      const child = TREE_NODES[childId];
      const onPath = pathSet.has(node.id) && pathSet.has(childId);
      drawLine(ctx, node.x, node.y, child.x, child.y, onPath ? COL_PATH : colors.border, onPath ? 3 : 1.5);
    }
  }

  // Draw nodes
  for (const node of Object.values(TREE_NODES)) {
    const r = 22;
    let fill = COL_UNSEEN;

    if (options.goalFound === node.id) fill = COL_GOAL;
    else if (options.path && pathSet.has(node.id)) fill = COL_PATH;
    else if (node.id === options.current) fill = COL_CURRENT;
    else if (options.explored?.has(node.id)) fill = COL_EXPLORED;
    else if (options.fringeNodes?.has(node.id)) fill = COL_FRINGE;

    if (options.clickable?.has(node.id)) {
      ctx.setLineDash([4, 4]);
      drawCircle(ctx, node.x, node.y, r + 3, 'transparent', colors.primary);
      ctx.setLineDash([]);
    }

    drawCircle(ctx, node.x, node.y, r, fill, colors.text);

    const isGoal = node.id === TREE_GOAL;
    drawText(ctx, node.id + (isGoal ? ' (G)' : ''), node.x, node.y, {
      color: '#fff',
      font: 'bold 14px var(--font-sans, system-ui, sans-serif)',
    });
  }
}
