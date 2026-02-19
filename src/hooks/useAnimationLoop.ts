import { useCallback, useEffect, useRef } from 'react';
import { TweenEngine } from '../visualizations/tween';

/**
 * RAF loop that ticks a TweenEngine and calls a draw function each frame.
 * Automatically pauses when no tweens are active and restarts on demand.
 */
export function useAnimationLoop(
  draw: (tweenEngine: TweenEngine) => void,
  deps: React.DependencyList = [],
) {
  const tweenRef = useRef<TweenEngine>(new TweenEngine());
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  const loop = useCallback(() => {
    const engine = tweenRef.current;
    const hasActive = engine.tick();
    drawRef.current(engine);
    if (hasActive) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      runningRef.current = false;
    }
  }, []);

  /** Kick the loop if it's not already running */
  const requestFrame = useCallback(() => {
    if (!runningRef.current) {
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  /** Force a single draw (e.g. after state change without animation) */
  const drawOnce = useCallback(() => {
    drawRef.current(tweenRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      tweenRef.current.clear();
      runningRef.current = false;
    };
  }, []);

  // Re-draw when deps change
  useEffect(() => {
    drawOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    tweenEngine: tweenRef.current,
    requestFrame,
    drawOnce,
  };
}
