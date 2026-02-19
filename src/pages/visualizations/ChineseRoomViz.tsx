import { useRef, useEffect, useState, useCallback } from 'react';
import {
  setupCanvas,
  drawRoundRect,
  drawText,
  drawCircle,
  getThemeColors,
} from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { TweenEngine, easeOut, spring } from '../../visualizations/tween.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORLD_W = 700;
const WORLD_H = 350;
const TOTAL_STEPS = 6; // 0..5

// Layout constants (relative to world space)
const ROOM_X = 220;
const ROOM_Y = 50;
const ROOM_W = 260;
const ROOM_H = 200;
const ROOM_R = 14;

const INPUT_START_X = 40;
const INPUT_Y = 150;
const INPUT_ENTER_X = ROOM_X + 40;

const OUTPUT_EXIT_X = ROOM_X + ROOM_W - 40;
const OUTPUT_END_X = 560;
const OUTPUT_Y = 150;

const OBSERVER_X = 630;
const OBSERVER_Y = 140;

const CARD_W = 60;
const CARD_H = 36;

// ---------------------------------------------------------------------------
// Animated state that tweens can mutate
// ---------------------------------------------------------------------------

interface AnimState {
  inputX: number;
  inputOpacity: number;
  outputX: number;
  outputOpacity: number;
  rulebookPulse: number;
  bubbleOpacity: number;
  insightOpacity: number;
}

function makeInitialAnimState(): AnimState {
  return {
    inputX: INPUT_START_X,
    inputOpacity: 0,
    outputX: OUTPUT_EXIT_X,
    outputOpacity: 0,
    rulebookPulse: 0,
    bubbleOpacity: 0,
    insightOpacity: 0,
  };
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  anim: AnimState,
  time: number,
) {
  const c = getThemeColors();
  const sx = w / WORLD_W;
  const sy = h / WORLD_H;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.scale(sx, sy);

  // -- Room --
  drawRoundRect(ctx, ROOM_X, ROOM_Y, ROOM_W, ROOM_H, ROOM_R, c.surface, c.border);
  ctx.lineWidth = 2;
  ctx.strokeStyle = c.border;
  ctx.strokeRect(ROOM_X, ROOM_Y, ROOM_W, ROOM_H);

  drawText(ctx, 'Chinese Room', ROOM_X + ROOM_W / 2, ROOM_Y + 22, {
    color: c.text,
    font: 'bold 15px var(--font-sans, system-ui, sans-serif)',
  });

  // -- Person icon (stick figure) inside room --
  const personX = ROOM_X + ROOM_W / 2 - 40;
  const personY = ROOM_Y + 100;

  // Head
  drawCircle(ctx, personX, personY - 22, 12, c.primary, c.text);
  // Body
  ctx.beginPath();
  ctx.moveTo(personX, personY - 10);
  ctx.lineTo(personX, personY + 20);
  ctx.strokeStyle = c.text;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Arms
  ctx.beginPath();
  ctx.moveTo(personX - 14, personY + 2);
  ctx.lineTo(personX + 14, personY + 2);
  ctx.stroke();
  // Legs
  ctx.beginPath();
  ctx.moveTo(personX, personY + 20);
  ctx.lineTo(personX - 10, personY + 36);
  ctx.moveTo(personX, personY + 20);
  ctx.lineTo(personX + 10, personY + 36);
  ctx.stroke();

  // Label below person
  drawText(ctx, 'Person', personX, personY + 50, {
    color: c.secondary,
    font: '11px var(--font-sans, system-ui, sans-serif)',
  });

  // -- Rulebook --
  const bookX = ROOM_X + ROOM_W / 2 + 20;
  const bookY = ROOM_Y + 80;
  const bookW = 50;
  const bookH = 64;

  // Pulsing scale during step 2
  const pulse = 1 + anim.rulebookPulse * 0.08 * Math.sin(time * 0.006);

  ctx.save();
  ctx.translate(bookX + bookW / 2, bookY + bookH / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(bookX + bookW / 2), -(bookY + bookH / 2));

  drawRoundRect(ctx, bookX, bookY, bookW, bookH, 4, c.warning, c.text);
  drawText(ctx, 'Rule', bookX + bookW / 2, bookY + bookH / 2 - 8, {
    color: c.text,
    font: 'bold 11px var(--font-sans, system-ui, sans-serif)',
  });
  drawText(ctx, 'Book', bookX + bookW / 2, bookY + bookH / 2 + 8, {
    color: c.text,
    font: 'bold 11px var(--font-sans, system-ui, sans-serif)',
  });
  ctx.restore();

  // -- Input card --
  if (anim.inputOpacity > 0.01) {
    ctx.globalAlpha = anim.inputOpacity;
    drawRoundRect(
      ctx,
      anim.inputX - CARD_W / 2,
      INPUT_Y - CARD_H / 2,
      CARD_W,
      CARD_H,
      6,
      c.error,
      c.text,
    );
    drawText(ctx, '\u4f60\u597d', anim.inputX, INPUT_Y, {
      color: '#fff',
      font: 'bold 16px var(--font-sans, system-ui, sans-serif)',
    });
    ctx.globalAlpha = 1;
  }

  // Input label
  if (step >= 1) {
    drawText(ctx, 'Input', INPUT_START_X, INPUT_Y - 30, {
      color: c.secondary,
      font: '11px var(--font-sans, system-ui, sans-serif)',
    });
  }

  // -- Arrow pointing into room (left side) --
  drawText(ctx, '\u2192', ROOM_X - 16, INPUT_Y, {
    color: c.secondary,
    font: '20px var(--font-sans, system-ui, sans-serif)',
  });

  // -- Arrow pointing out of room (right side) --
  drawText(ctx, '\u2192', ROOM_X + ROOM_W + 6, OUTPUT_Y, {
    color: c.secondary,
    font: '20px var(--font-sans, system-ui, sans-serif)',
  });

  // -- Output card --
  if (anim.outputOpacity > 0.01) {
    ctx.globalAlpha = anim.outputOpacity;
    drawRoundRect(
      ctx,
      anim.outputX - CARD_W / 2,
      OUTPUT_Y - CARD_H / 2,
      CARD_W,
      CARD_H,
      6,
      c.success,
      c.text,
    );
    drawText(ctx, '\u4f60\u597d\u4e16\u754c', anim.outputX, OUTPUT_Y, {
      color: '#fff',
      font: 'bold 14px var(--font-sans, system-ui, sans-serif)',
    });
    ctx.globalAlpha = 1;
  }

  // Output label
  if (step >= 3) {
    drawText(ctx, 'Output', OUTPUT_END_X, OUTPUT_Y - 30, {
      color: c.secondary,
      font: '11px var(--font-sans, system-ui, sans-serif)',
    });
  }

  // -- Observer (right side) --
  const obsX = OBSERVER_X;
  const obsY = OBSERVER_Y;

  // Head
  drawCircle(ctx, obsX, obsY - 22, 12, c.secondary, c.text);
  // Body
  ctx.beginPath();
  ctx.moveTo(obsX, obsY - 10);
  ctx.lineTo(obsX, obsY + 20);
  ctx.strokeStyle = c.text;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Arms
  ctx.beginPath();
  ctx.moveTo(obsX - 14, obsY + 2);
  ctx.lineTo(obsX + 14, obsY + 2);
  ctx.stroke();
  // Legs
  ctx.beginPath();
  ctx.moveTo(obsX, obsY + 20);
  ctx.lineTo(obsX - 10, obsY + 36);
  ctx.moveTo(obsX, obsY + 20);
  ctx.lineTo(obsX + 10, obsY + 36);
  ctx.stroke();

  drawText(ctx, 'Observer', obsX, obsY + 50, {
    color: c.secondary,
    font: '11px var(--font-sans, system-ui, sans-serif)',
  });

  // -- Speech bubble --
  if (anim.bubbleOpacity > 0.01) {
    ctx.globalAlpha = anim.bubbleOpacity;
    const bx = obsX - 90;
    const by = obsY - 72;
    const bw = 130;
    const bh = 34;

    drawRoundRect(ctx, bx, by, bw, bh, 8, c.surface, c.text);

    // Bubble tail
    ctx.beginPath();
    ctx.moveTo(obsX - 10, by + bh);
    ctx.lineTo(obsX - 4, by + bh + 10);
    ctx.lineTo(obsX + 4, by + bh);
    ctx.fillStyle = c.surface;
    ctx.fill();
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(obsX - 10, by + bh);
    ctx.lineTo(obsX - 4, by + bh + 10);
    ctx.lineTo(obsX + 4, by + bh);
    ctx.stroke();

    // Cover the border under the tail opening
    ctx.fillStyle = c.surface;
    ctx.fillRect(obsX - 9, by + bh - 1, 12, 2);

    drawText(ctx, 'It speaks Chinese!', bx + bw / 2, by + bh / 2, {
      color: c.text,
      font: 'bold 11px var(--font-sans, system-ui, sans-serif)',
    });
    ctx.globalAlpha = 1;
  }

  // -- Insight text (step 5) --
  if (anim.insightOpacity > 0.01) {
    ctx.globalAlpha = anim.insightOpacity;

    const iy = ROOM_Y + ROOM_H + 40;
    drawRoundRect(ctx, WORLD_W / 2 - 190, iy - 16, 380, 36, 8, c.primary);
    drawText(ctx, 'But nobody inside understands Chinese', WORLD_W / 2, iy + 2, {
      color: '#fff',
      font: 'bold 14px var(--font-sans, system-ui, sans-serif)',
    });
    ctx.globalAlpha = 1;
  }

  // -- Step indicator --
  drawText(ctx, `Step ${step} / ${TOTAL_STEPS - 1}`, WORLD_W / 2, WORLD_H - 16, {
    color: c.secondary,
    font: '12px var(--font-sans, system-ui, sans-serif)',
  });

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChineseRoomViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W, height: WORLD_H });
  const displayW = Math.min(containerW - 16, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));

  const tweenRef = useRef(new TweenEngine());
  const animRef = useRef<AnimState>(makeInitialAnimState());
  const rafRef = useRef(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef(0);

  // Kick off tweens for a given step
  const enterStep = useCallback((s: number) => {
    const tw = tweenRef.current;
    const a = animRef.current;
    tw.clear();

    switch (s) {
      case 0:
        // Reset everything
        Object.assign(a, makeInitialAnimState());
        break;
      case 1:
        // Input slides in from left toward room entrance
        a.inputOpacity = 1;
        a.inputX = INPUT_START_X;
        tw.to(a as unknown as Record<string, number>, { inputX: ROOM_X - CARD_W / 2 - 10 }, 700, easeOut);
        break;
      case 2:
        // Input enters room, rulebook pulses
        tw.to(a as unknown as Record<string, number>, { inputX: INPUT_ENTER_X }, 500, easeOut, () => {
          tw.to(a as unknown as Record<string, number>, { inputOpacity: 0 }, 300, easeOut);
          tw.to(a as unknown as Record<string, number>, { rulebookPulse: 1 }, 400, spring);
        });
        break;
      case 3:
        // Output slides out from room to right
        a.rulebookPulse = 0;
        a.outputOpacity = 1;
        a.outputX = OUTPUT_EXIT_X;
        tw.to(a as unknown as Record<string, number>, { outputX: OUTPUT_END_X }, 700, easeOut);
        break;
      case 4:
        // Observer speech bubble appears
        tw.to(a as unknown as Record<string, number>, { bubbleOpacity: 1 }, 500, spring);
        break;
      case 5:
        // Key insight
        tw.to(a as unknown as Record<string, number>, { insightOpacity: 1 }, 600, easeOut);
        break;
    }
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayW <= 0) return;

    const ctx = setupCanvas(canvas, displayW, displayH);

    function loop() {
      const now = performance.now();
      tweenRef.current.tick(now);
      draw(ctx, displayW, displayH, step, animRef.current, now);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [displayW, displayH, step]);

  // Auto-play timer
  useEffect(() => {
    if (!playing) {
      clearTimeout(playTimerRef.current);
      return;
    }

    const delay = step === 0 ? 600 : step === 2 ? 2000 : 1400;

    playTimerRef.current = window.setTimeout(() => {
      setStep((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_STEPS) {
          setPlaying(false);
          return prev;
        }
        enterStep(next);
        return next;
      });
    }, delay);

    return () => clearTimeout(playTimerRef.current);
  }, [playing, step, enterStep]);

  const handleStep = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_STEPS) return prev;
      enterStep(next);
      return next;
    });
    setPlaying(false);
  }, [enterStep]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    tweenRef.current.clear();
    Object.assign(animRef.current, makeInitialAnimState());
    setStep(0);
  }, []);

  const handlePlayPause = useCallback(() => {
    setPlaying((prev) => {
      if (!prev && step === 0) {
        enterStep(1);
        setStep(1);
      }
      return !prev;
    });
  }, [step, enterStep]);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <canvas ref={canvasRef} className="block mx-auto" />
      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          onClick={handlePlayPause}
          className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleStep}
          disabled={step >= TOTAL_STEPS - 1}
          className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors disabled:opacity-40"
        >
          Step
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
