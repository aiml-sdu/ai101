import { useRef, useEffect, useCallback, useState } from 'react';
import { setupCanvas } from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';
import { AnimationController } from '../../visualizations/animation-loop.ts';
import { bfs, dfs, type SearchState, type FringeEntry } from '../../lib/search.ts';
import { drawTree, getTreeNeighbors, TREE_GOAL, COL_UNSEEN, COL_FRINGE, COL_CURRENT, COL_EXPLORED, COL_GOAL, COL_PATH } from './tree-drawing.ts';
import AlgoControls from '../../components/AlgoControls.tsx';

const WORLD_W = 700;
const WORLD_H = 260;

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

export default function SideBySideViz() {
  const bfsContainerRef = useRef<HTMLDivElement>(null);
  const dfsContainerRef = useRef<HTMLDivElement>(null);
  const bfsCanvasRef = useRef<HTMLCanvasElement>(null);
  const dfsCanvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<AnimationController | null>(null);
  const bfsStatesRef = useRef<SearchState[]>([]);
  const dfsStatesRef = useRef<SearchState[]>([]);
  const maxLenRef = useRef(0);
  const stateIdxRef = useRef(0);

  const { width: bfsW } = useContainerSize(bfsContainerRef, { width: 340, height: 260 });
  const { width: dfsW } = useContainerSize(dfsContainerRef, { width: 340, height: 260 });

  const bfsCw = Math.max(bfsW - 16, 200);
  const dfsCw = Math.max(dfsW - 16, 200);
  const bfsCh = Math.round(bfsCw * (WORLD_H / WORLD_W));
  const dfsCh = Math.round(dfsCw * (WORLD_H / WORLD_W));

  const bfsCamera = useCanvasCamera(bfsCanvasRef, { panDisabled: true, zoomDisabled: true });
  const dfsCamera = useCanvasCamera(dfsCanvasRef, { panDisabled: true, zoomDisabled: true });

  const bfsCameraRef = useRef(bfsCamera.camera);
  bfsCameraRef.current = bfsCamera.camera;
  const dfsCameraRef = useRef(dfsCamera.camera);
  dfsCameraRef.current = dfsCamera.camera;
  const bfsCwRef = useRef(bfsCw);
  bfsCwRef.current = bfsCw;
  const bfsChRef = useRef(bfsCh);
  bfsChRef.current = bfsCh;
  const dfsCwRef = useRef(dfsCw);
  dfsCwRef.current = dfsCw;
  const dfsChRef = useRef(dfsCh);
  dfsChRef.current = dfsCh;

  const [playing, setPlaying] = useState(false);
  const [canStepForward, setCanStepForward] = useState(true);
  const [canStepBack, setCanStepBack] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [bfsFringeText, setBfsFringeText] = useState('');
  const [dfsFringeText, setDfsFringeText] = useState('');

  useEffect(() => {
    if (bfsCw > 0 && dfsCw > 0) {
      bfsCamera.fitToView(bfsCw, bfsCh, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
      dfsCamera.fitToView(dfsCw, dfsCh, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
    }
  }, [bfsCw, bfsCh, dfsCw, dfsCh, bfsCamera.fitToView, dfsCamera.fitToView]);

  const renderState = useCallback((idx: number) => {
    // BFS side
    const bfsCanvas = bfsCanvasRef.current;
    const bfsStates = bfsStatesRef.current;
    const _bfsCw = bfsCwRef.current;
    const _bfsCh = bfsChRef.current;
    const _bfsCamera = bfsCameraRef.current;
    if (bfsCanvas && bfsStates.length > 0 && _bfsCw > 0) {
      const bState = bfsStates[Math.min(idx, bfsStates.length - 1)];
      const bCtx = setupCanvas(bfsCanvas, _bfsCw, _bfsCh);
      const bFringe = new Set(bState.fringe.map((e) => e.node));

      bCtx.save();
      bCtx.translate(_bfsCamera.x, _bfsCamera.y);
      bCtx.scale(_bfsCamera.zoom, _bfsCamera.zoom);

      drawTree(bCtx, WORLD_W, WORLD_H, {
        current: bState.current,
        explored: bState.explored,
        fringeNodes: bFringe,
        goalFound: bState.type === 'solution' ? bState.current : undefined,
        path: bState.path,
      });

      bCtx.restore();
      setBfsFringeText(formatFringe(bState.fringe));
    }

    // DFS side
    const dfsCanvas = dfsCanvasRef.current;
    const dfsStates = dfsStatesRef.current;
    const _dfsCw = dfsCwRef.current;
    const _dfsCh = dfsChRef.current;
    const _dfsCamera = dfsCameraRef.current;
    if (dfsCanvas && dfsStates.length > 0 && _dfsCw > 0) {
      const dState = dfsStates[Math.min(idx, dfsStates.length - 1)];
      const dCtx = setupCanvas(dfsCanvas, _dfsCw, _dfsCh);
      const dFringe = new Set(dState.fringe.map((e) => e.node));

      dCtx.save();
      dCtx.translate(_dfsCamera.x, _dfsCamera.y);
      dCtx.scale(_dfsCamera.zoom, _dfsCamera.zoom);

      drawTree(dCtx, WORLD_W, WORLD_H, {
        current: dState.current,
        explored: dState.explored,
        fringeNodes: dFringe,
        goalFound: dState.type === 'solution' ? dState.current : undefined,
        path: dState.path,
      });

      dCtx.restore();
      const stackReversed = [...dState.fringe].reverse();
      setDfsFringeText(formatFringe(stackReversed));
    }
  }, []);

  useEffect(() => {
    bfsStatesRef.current = collectStates(bfs('A', TREE_GOAL, getTreeNeighbors));
    dfsStatesRef.current = collectStates(dfs('A', TREE_GOAL, getTreeNeighbors));
    const maxLen = Math.max(bfsStatesRef.current.length, dfsStatesRef.current.length);
    maxLenRef.current = maxLen;

    const controller = new AnimationController({
      onStepChange: (step) => {
        stateIdxRef.current = step;
        setCanStepForward(step < maxLen);
        setCanStepBack(step > 0);
        setPlaying(controller.isPlaying());
      },
    });

    const stepFns = Array.from({ length: maxLen }, (_, i) => () => renderState(i));
    controller.setSteps(stepFns);
    controllerRef.current = controller;

    renderState(0);

    return () => {
      controller.destroy();
    };
  }, []);

  // Re-render on camera/size change
  useEffect(() => {
    renderState(stateIdxRef.current);
  }, [bfsCamera.camera, dfsCamera.camera, bfsCw, dfsCw]);

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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="rounded-lg border bg-card p-4 overflow-hidden" ref={bfsContainerRef}>
          <div className="text-sm font-medium text-muted-foreground mb-3">BFS</div>
          <canvas ref={bfsCanvasRef} style={{ cursor: 'default' }} />
          <div className="mt-3 text-sm font-mono leading-relaxed min-h-6">
            <strong>Queue:</strong>{' '}
            {bfsFringeText || <em className="text-muted-foreground">empty</em>}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 overflow-hidden" ref={dfsContainerRef}>
          <div className="text-sm font-medium text-muted-foreground mb-3">DFS</div>
          <canvas ref={dfsCanvasRef} style={{ cursor: 'default' }} />
          <div className="mt-3 text-sm font-mono leading-relaxed min-h-6">
            <strong>Stack:</strong>{' '}
            {dfsFringeText || <em className="text-muted-foreground">empty</em>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 mb-2 text-[10px] text-muted-foreground justify-center">
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
    </div>
  );
}
