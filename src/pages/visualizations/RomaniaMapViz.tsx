import { useRef, useEffect, useCallback, useState } from 'react';
import { CITIES, EDGES } from '../../lib/romania-graph.ts';
import { setupCanvas, drawCircle, drawLine, drawText, getThemeColors } from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';
import type { FringeEntry } from '../../lib/search.ts';

// ---- Color constants ----
const COL_UNSEEN = '#9ca3af';
const COL_FRINGE = '#fbbf24';
const COL_CURRENT = '#ef4444';
const COL_EXPLORED = '#22c55e';
const COL_PATH = '#8b5cf6';

// World-space bounds for the Romania map
const WORLD_W = 800;
const WORLD_H = 520;

function areAdjacent(a: string, b: string, path: string[]): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) return true;
  }
  return false;
}

export interface RomaniaMapOptions {
  current?: string;
  explored?: Set<string>;
  fringe?: FringeEntry[];
  path?: string[];
  highlightStart?: boolean;
  highlightGoal?: boolean;
  hoverCity?: string | null;
}

/** Draw Romania map in world-space (800×520). Caller applies camera transform. */
export function drawRomaniaMap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: RomaniaMapOptions = {},
) {
  const colors = getThemeColors();
  const scaleX = w / WORLD_W;
  const scaleY = h / WORLD_H;

  ctx.clearRect(0, 0, w, h);

  const fringeNodes = new Set((options.fringe ?? []).map((e) => e.node));
  const pathSet = new Set(options.path ?? []);

  for (const edge of EDGES) {
    const from = CITIES[edge.from];
    const to = CITIES[edge.to];
    const x1 = from.x * scaleX;
    const y1 = from.y * scaleY;
    const x2 = to.x * scaleX;
    const y2 = to.y * scaleY;

    const onPath = pathSet.has(edge.from) && pathSet.has(edge.to) && options.path && areAdjacent(edge.from, edge.to, options.path);
    const edgeColor = onPath ? COL_PATH : colors.border;
    const edgeWidth = onPath ? 3 : 1;

    drawLine(ctx, x1, y1, x2, y2, edgeColor, edgeWidth);

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    drawText(ctx, String(edge.cost), mx, my - 8, {
      color: colors.secondary,
      font: '10px var(--font-sans, system-ui, sans-serif)',
    });
  }

  for (const [name, city] of Object.entries(CITIES)) {
    const cx = city.x * scaleX;
    const cy = city.y * scaleY;
    const r = 14;

    let fill = COL_UNSEEN;
    if (options.path && pathSet.has(name)) fill = COL_PATH;
    else if (name === options.current) fill = COL_CURRENT;
    else if (options.explored?.has(name)) fill = COL_EXPLORED;
    else if (fringeNodes.has(name)) fill = COL_FRINGE;

    if (options.highlightStart && name === 'Arad') fill = COL_EXPLORED;
    if (options.highlightGoal && name === 'Bucharest') fill = COL_CURRENT;

    // Hover glow
    if (options.hoverCity === name) {
      ctx.save();
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 16;
      drawCircle(ctx, cx, cy, r + 2, 'transparent', colors.primary);
      ctx.restore();
    }

    drawCircle(ctx, cx, cy, r, fill, colors.text);

    drawText(ctx, name, cx, cy + r + 12, {
      color: colors.text,
      font: '10px var(--font-sans, system-ui, sans-serif)',
    });

    if (options.hoverCity === name) {
      const tooltip = `${name} (hSLD: ${city.hSLD})`;
      drawText(ctx, tooltip, cx, cy - r - 10, {
        color: colors.primary,
        font: 'bold 12px var(--font-sans, system-ui, sans-serif)',
      });
    }
  }
}

export default function RomaniaMapViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width: cw } = useContainerSize(containerRef, { width: 700, height: 460 });
  const ch = Math.round(cw * (WORLD_H / WORLD_W));

  const { camera, fitToView, screenToWorld } = useCanvasCamera(canvasRef);
  const [hoverCity, setHoverCity] = useState<string | null>(null);

  // Fit camera to world bounds on size change
  useEffect(() => {
    if (cw > 0) {
      fitToView(cw, ch, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
    }
  }, [cw, ch, fitToView]);

  // Redraw when camera, size, or hover changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cw <= 0) return;
    const ctx = setupCanvas(canvas, cw, ch);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    drawRomaniaMap(ctx, WORLD_W, WORLD_H, {
      highlightStart: true,
      highlightGoal: true,
      hoverCity,
    });

    ctx.restore();
  }, [cw, ch, camera, hoverCity]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const sx = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / dpr / rect.height);
    const { x: wx, y: wy } = screenToWorld(sx, sy);

    let found: string | null = null;
    for (const [name, city] of Object.entries(CITIES)) {
      const dx = city.x - wx;
      const dy = city.y - wy;
      if (dx * dx + dy * dy < 25 * 25) {
        found = name;
        break;
      }
    }
    if (found !== hoverCity) {
      setHoverCity(found);
    }
  }, [hoverCity, screenToWorld]);

  const handleMouseLeave = useCallback(() => {
    setHoverCity(null);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-3">Romania Road Map</div>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: hoverCity ? 'pointer' : 'grab' }}
      />
      <p className="mt-1 text-[10px] text-muted-foreground/60 text-center select-none">
        Ctrl + scroll to zoom
      </p>
    </div>
  );
}
