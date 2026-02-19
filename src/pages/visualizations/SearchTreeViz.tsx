import { useRef, useEffect, useCallback, useState } from 'react';
import { setupCanvas } from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';
import { AnimationController } from '../../visualizations/animation-loop.ts';
import { bfs, dfs, type SearchState, type FringeEntry } from '../../lib/search.ts';
import { drawTree, getTreeNeighbors, TREE_GOAL, COL_UNSEEN, COL_FRINGE, COL_CURRENT, COL_EXPLORED, COL_GOAL, COL_PATH } from './tree-drawing.ts';
import AlgoControls from '../../components/AlgoControls.tsx';

const WORLD_W = 700;
const WORLD_H = 280;

function collectStates(gen: Generator<SearchState>): SearchState[] {
  const states: SearchState[] = [];
  for (const s of gen) {
    states.push(s);
  }
  return states;
}

function formatFringe(fringe: FringeEntry[]): string {
  if (fringe.length === 0) return '';
  return fringe.map((e) => e.node).join(' \u2192 ');
}

interface SearchTreeVizProps {
  algorithm: 'bfs' | 'dfs';
  label: string;
  fringeLabel: string;
}

export default function SearchTreeViz({ algorithm, label, fringeLabel }: SearchTreeVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<AnimationController | null>(null);
  const statesRef = useRef<SearchState[]>([]);
  const stateIdxRef = useRef(0);

  const { width: containerW } = useContainerSize(containerRef, { width: 700, height: 280 });
  const cw = Math.min(containerW - 16, WORLD_W);
  const ch = Math.round(cw * (WORLD_H / WORLD_W));

  const { camera, fitToView } = useCanvasCamera(canvasRef, { panDisabled: true, zoomDisabled: true });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const cwRef = useRef(cw);
  cwRef.current = cw;
  const chRef = useRef(ch);
  chRef.current = ch;
  const [playing, setPlaying] = useState(false);
  const [canStepForward, setCanStepForward] = useState(true);
  const [canStepBack, setCanStepBack] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fringeText, setFringeText] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (cw > 0) {
      fitToView(cw, ch, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
    }
  }, [cw, ch, fitToView]);

  const renderState = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    const _cw = cwRef.current;
    const _ch = chRef.current;
    const _camera = cameraRef.current;
    if (!canvas || _cw <= 0) return;
    const states = statesRef.current;
    const state = states[Math.min(idx, states.length - 1)];
    const ctx = setupCanvas(canvas, _cw, _ch);
    const fringeNodes = new Set(state.fringe.map((e) => e.node));

    ctx.save();
    ctx.translate(_camera.x, _camera.y);
    ctx.scale(_camera.zoom, _camera.zoom);

    drawTree(ctx, WORLD_W, WORLD_H, {
      current: state.current,
      explored: state.explored,
      fringeNodes,
      goalFound: state.type === 'solution' ? state.current : undefined,
      path: state.path,
    });

    ctx.restore();

    if (algorithm === 'dfs') {
      const stackDisplay = [...state.fringe].reverse();
      setFringeText(formatFringe(stackDisplay));
    } else {
      setFringeText(formatFringe(state.fringe));
    }
    setMessageText(state.message);
  }, [algorithm]);

  useEffect(() => {
    const searchFn = algorithm === 'bfs' ? bfs : dfs;
    statesRef.current = collectStates(searchFn('A', TREE_GOAL, getTreeNeighbors));

    const states = statesRef.current;

    const controller = new AnimationController({
      onStepChange: (step) => {
        stateIdxRef.current = step;
        setCanStepForward(step < states.length);
        setCanStepBack(step > 0);
        setPlaying(controller.isPlaying());
      },
    });

    const stepFns = states.map((_, i) => () => renderState(i));
    controller.setSteps(stepFns);
    controllerRef.current = controller;

    renderState(0);

    return () => {
      controller.destroy();
    };
  }, [algorithm]);

  // Re-render on camera/size change
  useEffect(() => {
    renderState(stateIdxRef.current);
  }, [camera, cw, ch]);

  const handlePlay = useCallback(() => controllerRef.current?.play(), []);
  const handlePause = useCallback(() => controllerRef.current?.pause(), []);
  const handleStep = useCallback(() => controllerRef.current?.step(), []);
  const handleStepBack = useCallback(() => {
    const c = controllerRef.current;
    if (!c) return;
    const target = Math.max(0, c.getCurrentStep() - 1);
    c.reset();
    for (let i = 0; i <= target; i++) c.step();
  }, []);
  const handleReset = useCallback(() => {
    controllerRef.current?.reset();
    renderState(0);
  }, [renderState]);
  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    controllerRef.current?.setSpeed(s);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-3">{label}</div>
      <canvas ref={canvasRef} style={{ cursor: 'default' }} />
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground">
        {[
          { color: COL_UNSEEN, label: 'Unseen' },
          { color: COL_FRINGE, label: 'Fringe' },
          { color: COL_CURRENT, label: 'Current' },
          { color: COL_EXPLORED, label: 'Explored' },
          { color: COL_GOAL, label: 'Goal' },
          { color: COL_PATH, label: 'Path' },
        ].map(({ color, label }) => (
          <span key={label} className="inline-flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
      <AlgoControls
        playing={playing}
        canStepForward={canStepForward}
        canStepBack={canStepBack}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
      />
      <div className="mt-3 text-sm font-mono leading-relaxed min-h-6">
        <strong>{fringeLabel}:</strong>{' '}
        {fringeText || <em className="text-muted-foreground">empty</em>}
      </div>
      <div className="mt-2 text-xs text-muted-foreground italic min-h-5">
        {messageText}
      </div>
    </div>
  );
}
