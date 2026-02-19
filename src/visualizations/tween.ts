/**
 * Lightweight tween engine for smooth canvas animations.
 * Manages concurrent property tweens with easing functions.
 */

// ---- Easing functions ----

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function spring(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function elastic(t: number): number {
  const c5 = (2 * Math.PI) / 4.5;
  return t === 0 ? 0 : t === 1 ? 1 :
    t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
}

export function bounceOut(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function linear(t: number): number {
  return t;
}

export type EasingFn = (t: number) => number;

// ---- Tween types ----

interface ActiveTween {
  id: string;
  target: Record<string, number>;
  from: Record<string, number>;
  to: Record<string, number>;
  startTime: number;
  duration: number;
  easing: EasingFn;
  onComplete?: () => void;
}

// ---- TweenEngine ----

export class TweenEngine {
  private tweens: ActiveTween[] = [];
  private idCounter = 0;

  /**
   * Start a tween on a target object's numeric properties.
   * Returns a tween id that can be used to cancel.
   */
  to(
    target: Record<string, number>,
    to: Record<string, number>,
    duration: number,
    easing: EasingFn = easeOut,
    onComplete?: () => void,
  ): string {
    const id = `tw_${this.idCounter++}`;
    const from: Record<string, number> = {};
    for (const key of Object.keys(to)) {
      from[key] = target[key] ?? 0;
    }

    // Remove existing tweens on the same target + properties
    const newKeys = new Set(Object.keys(to));
    this.tweens = this.tweens.filter(
      (tw) => tw.target !== target || !Object.keys(tw.to).some((k) => newKeys.has(k)),
    );

    this.tweens.push({
      id,
      target,
      from,
      to,
      startTime: performance.now(),
      duration,
      easing,
      onComplete,
    });

    return id;
  }

  /** Cancel a specific tween by id */
  cancel(id: string): void {
    this.tweens = this.tweens.filter((tw) => tw.id !== id);
  }

  /** Cancel all tweens on a specific target */
  cancelAll(target: Record<string, number>): void {
    this.tweens = this.tweens.filter((tw) => tw.target !== target);
  }

  /**
   * Tick the engine. Call this every animation frame.
   * Returns true if any tweens are still active.
   */
  tick(now: number = performance.now()): boolean {
    const completed: ActiveTween[] = [];

    for (const tw of this.tweens) {
      const elapsed = now - tw.startTime;
      const rawT = Math.min(1, elapsed / tw.duration);
      const t = tw.easing(rawT);

      for (const key of Object.keys(tw.to)) {
        tw.target[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * t;
      }

      if (rawT >= 1) {
        completed.push(tw);
      }
    }

    if (completed.length > 0) {
      this.tweens = this.tweens.filter((tw) => !completed.includes(tw));
      for (const tw of completed) {
        tw.onComplete?.();
      }
    }

    return this.tweens.length > 0;
  }

  /** Check if any tweens are active */
  get active(): boolean {
    return this.tweens.length > 0;
  }

  /** Clear all tweens */
  clear(): void {
    this.tweens = [];
  }
}
