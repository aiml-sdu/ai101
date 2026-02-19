import { useRef, useEffect, useState, useCallback } from 'react';
import { CITIES, EDGES, getNeighbors } from '../../lib/romania-graph.ts';
import type { City } from '../../lib/romania-graph.ts';
import { astar, greedy, type SearchState, type FringeEntry } from '../../lib/search.ts';
import {
  setupCanvas,
  drawCircle,
  drawLine,
  drawText,
  drawRoundRect,
  getThemeColors,
} from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';
import AlgoControls from '../../components/AlgoControls.tsx';

type AlgoMode = 'astar' | 'greedy';

const WORLD_W = 820;
const WORLD_H = 520;

function hSLD(node: string): number {
  return CITIES[node]?.hSLD ?? 0;
}

function collectSteps(mode: AlgoMode): SearchState[] {
  const gen = mode === 'astar'
    ? astar('Arad', 'Bucharest', getNeighbors, hSLD)
    : greedy('Arad', 'Bucharest', getNeighbors, hSLD);
  const steps: SearchState[] = [];
  for (const s of gen) steps.push(s);
  return steps;
}

function scaleCity(city: City, cw: number, ch: number): { x: number; y: number } {
  const pad = 40;
  const x = pad + (city.x / 800) * (cw - 2 * pad);
  const y = pad + (city.y / 500) * (ch - 2 * pad);
  return { x, y };
}

function drawMap(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  state: SearchState | null,
  mode: AlgoMode,
) {
  const colors = getThemeColors();

  const explored = state?.explored ?? new Set<string>();
  const current = state?.current;
  const pathSet = new Set(state?.path ?? []);
  const fringeNodes = new Set((state?.fringe ?? []).map((e) => e.node));

  const fringeF: Record<string, number> = {};
  for (const entry of state?.fringe ?? []) {
    if (entry.f != null) fringeF[entry.node] = entry.f;
  }

  for (const edge of EDGES) {
    const from = scaleCity(CITIES[edge.from], cw, ch);
    const to = scaleCity(CITIES[edge.to], cw, ch);

    const onPath = pathSet.has(edge.from) && pathSet.has(edge.to) && state?.path;
    let edgeOnPath = false;
    if (onPath && state?.path) {
      const p = state.path;
      for (let i = 0; i < p.length - 1; i++) {
        if ((p[i] === edge.from && p[i + 1] === edge.to) ||
            (p[i] === edge.to && p[i + 1] === edge.from)) {
          edgeOnPath = true;
          break;
        }
      }
    }

    const edgeColor = edgeOnPath ? colors.success : colors.border;
    const edgeWidth = edgeOnPath ? 3 : 1;
    drawLine(ctx, from.x, from.y, to.x, to.y, edgeColor, edgeWidth);

    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    drawText(ctx, String(edge.cost), mx, my - 6, {
      color: colors.secondary,
      font: '10px var(--font-sans, system-ui, sans-serif)',
    });
  }

  for (const [key, city] of Object.entries(CITIES)) {
    const { x, y } = scaleCity(city, cw, ch);
    const r = 12;

    let fill = colors.surface;
    let stroke = colors.border;

    if (pathSet.has(key) && state?.type === 'solution') {
      fill = colors.success;
      stroke = colors.success;
    } else if (key === current) {
      fill = colors.primary;
      stroke = colors.primary;
    } else if (explored.has(key)) {
      fill = colors.secondary;
      stroke = colors.border;
    } else if (fringeNodes.has(key)) {
      fill = colors.warning;
      stroke = colors.warning;
    }

    drawCircle(ctx, x, y, r, fill, stroke);

    const nameColor = key === current ? 'white' : colors.text;
    drawText(ctx, city.name, x, y - r - 8, {
      color: nameColor,
      font: 'bold 10px var(--font-sans, system-ui, sans-serif)',
    });

    drawText(ctx, `h=${city.hSLD}`, x, y + r + 10, {
      color: colors.secondary,
      font: '9px var(--font-sans, system-ui, sans-serif)',
    });

    if (fringeF[key] != null) {
      drawText(ctx, `f=${Math.round(fringeF[key])}`, x, y + r + 20, {
        color: colors.warning,
        font: 'bold 9px var(--font-sans, system-ui, sans-serif)',
      });
    }
  }

  // Legend
  const ly = ch - 25;
  const lx = 15;
  drawCircle(ctx, lx, ly, 6, colors.primary);
  drawText(ctx, 'Current', lx + 30, ly, { color: colors.text, font: '11px var(--font-sans)', align: 'left' });
  drawCircle(ctx, lx + 80, ly, 6, colors.secondary);
  drawText(ctx, 'Explored', lx + 110, ly, { color: colors.text, font: '11px var(--font-sans)', align: 'left' });
  drawCircle(ctx, lx + 170, ly, 6, colors.warning);
  drawText(ctx, 'Fringe', lx + 200, ly, { color: colors.text, font: '11px var(--font-sans)', align: 'left' });
  drawCircle(ctx, lx + 250, ly, 6, colors.success);
  drawText(ctx, 'Path', lx + 275, ly, { color: colors.text, font: '11px var(--font-sans)', align: 'left' });

  // Mode label
  const modeLabel = mode === 'astar' ? 'A* Search' : 'Greedy Best-First';
  drawRoundRect(ctx, cw - 140, 8, 130, 24, 6, colors.primary);
  drawText(ctx, modeLabel, cw - 75, 20, {
    color: 'white',
    font: 'bold 12px var(--font-sans, system-ui, sans-serif)',
  });
}

interface AStarMapVizProps {
  mode?: AlgoMode;
}

export default function AStarMapViz({ mode = 'astar' }: AStarMapVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width: containerW } = useContainerSize(containerRef, { width: 820, height: 520 });
  const displayW = Math.min(containerW - 16, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));

  const { camera, fitToView } = useCanvasCamera(canvasRef);
  const fitDoneRef = useRef(false);

  const [steps, setSteps] = useState<SearchState[]>(() => collectSteps(mode));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (displayW > 0 && !fitDoneRef.current) {
      fitToView(displayW, displayH, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
      fitDoneRef.current = true;
    }
  }, [displayW, displayH, fitToView]);

  useEffect(() => {
    const newSteps = collectSteps(mode);
    setSteps(newSteps);
    setStepIdx(0);
    setPlaying(false);
  }, [mode]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayW <= 0) return;
    const ctx = setupCanvas(canvas, displayW, displayH);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    drawMap(ctx, WORLD_W, WORLD_H, steps[stepIdx] ?? null, mode);

    ctx.restore();
  }, [stepIdx, steps, mode, displayW, displayH, camera]);

  // Auto-play timer
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, steps.length]);

  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleStep = useCallback(() => {
    setPlaying(false);
    setStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);
  const handleStepBack = useCallback(() => {
    setPlaying(false);
    setStepIdx((prev) => Math.max(prev - 1, 0));
  }, []);
  const handleReset = useCallback(() => {
    setPlaying(false);
    setStepIdx(0);
  }, []);

  const currentState = steps[stepIdx];
  const fringeDisplay = (currentState?.fringe ?? []).slice(0, 8);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-3">
        {mode === 'astar' ? 'A* Search' : 'Greedy Best-First Search'}: Romania Map (Arad to Bucharest)
      </div>
      <canvas ref={canvasRef} style={{ cursor: 'grab' }} />
      <AlgoControls
        playing={playing}
        canStepForward={stepIdx < steps.length - 1}
        canStepBack={stepIdx > 0}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />
      <div style={{ padding: '8px 12px', fontSize: '13px' }}>
        <strong>Step {stepIdx + 1}/{steps.length}:</strong>{' '}
        {currentState?.message}
      </div>
      {currentState?.path && currentState.type === 'solution' && (
        <div style={{ padding: '4px 12px 8px', fontSize: '13px', color: 'var(--color-success)' }}>
          <strong>Path:</strong> {currentState.path.join(' → ')} | <strong>Cost:</strong> {currentState.cost}
        </div>
      )}
      {fringeDisplay.length > 0 && (
        <div style={{ padding: '4px 12px 12px', fontSize: '12px', overflowX: 'auto' }}>
          <strong>Fringe</strong> ({currentState?.fringe.length} nodes):
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            {fringeDisplay.map((entry: FringeEntry, i: number) => (
              <span key={i} style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
              }}>
                {entry.node} {mode === 'astar'
                  ? `f=${Math.round(entry.f ?? 0)} (g=${entry.cost}, h=${Math.round((entry.f ?? 0) - entry.cost)})`
                  : `h=${Math.round(entry.f ?? 0)}`}
              </span>
            ))}
            {(currentState?.fringe.length ?? 0) > 8 && (
              <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                ...and {(currentState?.fringe.length ?? 0) - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
