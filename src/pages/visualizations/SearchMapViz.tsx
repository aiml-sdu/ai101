import { useRef, useEffect, useCallback, useState } from 'react';
import { getNeighbors } from '../../lib/romania-graph.ts';
import { setupCanvas } from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';
import { AnimationController } from '../../visualizations/animation-loop.ts';
import { ucs, type SearchState, type FringeEntry } from '../../lib/search.ts';
import { drawRomaniaMap } from './RomaniaMapViz.tsx';
import AlgoControls from '../../components/AlgoControls.tsx';

const WORLD_W = 800;
const WORLD_H = 520;

function collectStates(gen: Generator<SearchState>): SearchState[] {
  const states: SearchState[] = [];
  for (const s of gen) {
    states.push(s);
  }
  return states;
}

function formatFringe(fringe: FringeEntry[], showCost = false): string {
  if (fringe.length === 0) return '';
  return fringe
    .map((e) => {
      const cost = showCost ? ` (${e.cost})` : '';
      return `${e.node}${cost}`;
    })
    .join(' \u2192 ');
}

export default function SearchMapViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<AnimationController | null>(null);
  const statesRef = useRef<SearchState[]>([]);
  const stateIdxRef = useRef(0);

  const { width: cw } = useContainerSize(containerRef, { width: 700, height: 460 });
  const ch = Math.round(cw * (WORLD_H / WORLD_W));
  const { camera, fitToView } = useCanvasCamera(canvasRef);

  const [playing, setPlaying] = useState(false);
  const [canStepForward, setCanStepForward] = useState(true);
  const [canStepBack, setCanStepBack] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fringeText, setFringeText] = useState('');
  const [messageText, setMessageText] = useState('');

  const fitDoneRef = useRef(false);

  useEffect(() => {
    if (cw > 0 && !fitDoneRef.current) {
      fitToView(cw, ch, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
      fitDoneRef.current = true;
    }
  }, [cw, ch, fitToView]);

  const renderState = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas || cw <= 0) return;
    const states = statesRef.current;
    const state = states[Math.min(idx, states.length - 1)];
    const ctx = setupCanvas(canvas, cw, ch);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    drawRomaniaMap(ctx, WORLD_W, WORLD_H, {
      current: state.current,
      explored: state.explored,
      fringe: state.fringe,
      path: state.path,
    });

    ctx.restore();

    const sorted = [...state.fringe].sort((a, b) => a.cost - b.cost);
    setFringeText(formatFringe(sorted, true));
    setMessageText(state.message);
  }, [cw, ch, camera]);

  useEffect(() => {
    statesRef.current = collectStates(ucs('Arad', 'Bucharest', getNeighbors));

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
  }, [renderState]);

  // Re-render on camera/size change
  useEffect(() => {
    renderState(stateIdxRef.current);
  }, [camera, cw, ch, renderState]);

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
      <div className="text-sm font-medium text-muted-foreground mb-3">UCS: Arad to Bucharest</div>
      <canvas ref={canvasRef} style={{ cursor: 'grab' }} />
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
        <strong>Fringe (Priority Queue by g(n)):</strong>{' '}
        {fringeText || <em className="text-muted-foreground">empty</em>}
      </div>
      <div className="mt-2 text-xs text-muted-foreground italic min-h-5">
        {messageText}
      </div>
    </div>
  );
}
