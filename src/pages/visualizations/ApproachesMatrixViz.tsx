import { useRef, useEffect, useCallback, useState } from 'react';
import {
  setupCanvas,
  drawRoundRect,
  drawText,
  drawLine,
  getThemeColors,
} from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';
import { useAnimationLoop } from '../../hooks/useAnimationLoop.ts';
import { easeOutBack, easeOut } from '../../visualizations/tween.ts';

// ---- World-space constants ----
const WORLD_W = 700;
const WORLD_H = 500;

const HEADER_LEFT = 80; // space for row headers
const HEADER_TOP = 50; // space for column headers
const GRID_W = WORLD_W - HEADER_LEFT - 30; // total grid width
const GRID_H = WORLD_H - HEADER_TOP - 30; // total grid height
const CELL_W = GRID_W / 2;
const CELL_H = GRID_H / 2;
const CELL_PAD = 8;

// ---- Quadrant data ----

interface Quadrant {
  row: number;
  col: number;
  label1: string;
  label2: string;
  description: string;
}

const QUADRANTS: Quadrant[] = [
  {
    row: 0,
    col: 0,
    label1: 'GPS',
    label2: 'Cognitive Science',
    description:
      'Thinking Humanly: Systems that model human cognitive processes. The General Problem Solver (GPS) by Newell & Simon attempted to mimic human reasoning steps.',
  },
  {
    row: 0,
    col: 1,
    label1: 'Expert Systems',
    label2: 'Logic Engines',
    description:
      'Thinking Rationally: Systems based on formal logic and inference rules. Expert systems encode domain knowledge as logical rules to derive conclusions.',
  },
  {
    row: 1,
    col: 0,
    label1: 'ELIZA',
    label2: 'Turing Test',
    description:
      'Acting Humanly: Systems that behave indistinguishably from humans. ELIZA simulated a therapist using pattern matching, inspiring the Turing Test benchmark.',
  },
  {
    row: 1,
    col: 1,
    label1: 'Deep Blue',
    label2: 'Self-driving Cars',
    description:
      'Acting Rationally: Rational agents that act to achieve optimal outcomes. Deep Blue defeated Kasparov through brute-force search and evaluation.',
  },
];

const ROW_HEADERS = ['Thinking', 'Acting'];
const COL_HEADERS = ['Humanly', 'Rationally'];

// ---- Per-quadrant animated state ----
interface QuadAnim {
  scale: number;
  opacity: number;
  [key: string]: number;
}

function hexToRgba(color: string, alpha: number): string {
  // Handle rgb(...) format from resolveOklch
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }
  // Handle hex
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ApproachesMatrixViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width: containerW } = useContainerSize(containerRef, {
    width: WORLD_W,
    height: WORLD_H,
  });
  const displayW = Math.min(containerW - 16, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));

  const { camera, fitToView, screenToWorld } = useCanvasCamera(canvasRef);
  const [selected, setSelected] = useState<number | null>(null);
  const fitDoneRef = useRef(false);
  const introAnimRef = useRef(false);

  // Animated state per quadrant
  const quadAnimsRef = useRef<QuadAnim[]>(
    QUADRANTS.map(() => ({ scale: 0, opacity: 0 })),
  );

  // Fit camera on first size
  useEffect(() => {
    if (displayW > 0 && !fitDoneRef.current) {
      fitToView(displayW, displayH, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
      fitDoneRef.current = true;
    }
  }, [displayW, displayH, fitToView]);

  // Draw callback
  const { tweenEngine, requestFrame, drawOnce } = useAnimationLoop(
    () => {
      const canvas = canvasRef.current;
      if (!canvas || displayW <= 0) return;
      const ctx = setupCanvas(canvas, displayW, displayH);
      const colors = getThemeColors();

      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      // Clear world area
      ctx.clearRect(0, 0, WORLD_W, WORLD_H);

      // Column headers
      for (let c = 0; c < 2; c++) {
        const cx = HEADER_LEFT + c * CELL_W + CELL_W / 2;
        drawText(ctx, COL_HEADERS[c], cx, 20, {
          color: colors.text,
          font: 'bold 18px var(--font-sans, system-ui, sans-serif)',
        });
      }

      // Row headers
      for (let r = 0; r < 2; r++) {
        const cy = HEADER_TOP + r * CELL_H + CELL_H / 2;
        ctx.save();
        ctx.translate(30, cy);
        ctx.rotate(-Math.PI / 2);
        drawText(ctx, ROW_HEADERS[r], 0, 0, {
          color: colors.text,
          font: 'bold 18px var(--font-sans, system-ui, sans-serif)',
        });
        ctx.restore();
      }

      // Grid lines
      // Horizontal divider
      drawLine(
        ctx,
        HEADER_LEFT,
        HEADER_TOP + CELL_H,
        HEADER_LEFT + GRID_W,
        HEADER_TOP + CELL_H,
        colors.border,
        1.5,
      );
      // Vertical divider
      drawLine(
        ctx,
        HEADER_LEFT + CELL_W,
        HEADER_TOP,
        HEADER_LEFT + CELL_W,
        HEADER_TOP + GRID_H,
        colors.border,
        1.5,
      );
      // Outer border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(HEADER_LEFT, HEADER_TOP, GRID_W, GRID_H);

      // Draw quadrants
      for (let i = 0; i < QUADRANTS.length; i++) {
        const q = QUADRANTS[i];
        const anim = quadAnimsRef.current[i];
        const isSelected = selected === i;

        const x = HEADER_LEFT + q.col * CELL_W + CELL_PAD;
        const y = HEADER_TOP + q.row * CELL_H + CELL_PAD;
        const w = CELL_W - CELL_PAD * 2;
        const h = CELL_H - CELL_PAD * 2;
        const cx = x + w / 2;
        const cy = y + h / 2;

        // Apply animated scale from center
        const s = anim.scale;
        const alpha = anim.opacity;

        if (alpha <= 0) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.scale(s, s);
        ctx.translate(-cx, -cy);

        // Background fill
        if (isSelected) {
          // Glow / shadow
          ctx.save();
          ctx.shadowColor = hexToRgba(colors.primary, 0.4);
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          drawRoundRect(
            ctx,
            x,
            y,
            w,
            h,
            12,
            hexToRgba(colors.primary, 0.12),
            colors.primary,
          );
          ctx.restore();
        } else {
          drawRoundRect(ctx, x, y, w, h, 12, colors.surface, colors.border);
        }

        // Label 1 (main example)
        drawText(ctx, q.label1, cx, cy - 18, {
          color: isSelected ? colors.primary : colors.text,
          font: 'bold 16px var(--font-sans, system-ui, sans-serif)',
        });

        // Label 2 (secondary example)
        drawText(ctx, q.label2, cx, cy + 12, {
          color: isSelected ? colors.primary : colors.secondary,
          font: '13px var(--font-sans, system-ui, sans-serif)',
        });

        ctx.restore();
      }

      ctx.restore();
    },
    [displayW, displayH, camera, selected],
  );

  // Intro animation: stagger float-in for each quadrant
  useEffect(() => {
    if (introAnimRef.current) return;
    introAnimRef.current = true;

    for (let i = 0; i < QUADRANTS.length; i++) {
      const anim = quadAnimsRef.current[i];
      anim.scale = 0;
      anim.opacity = 0;

      // Stagger: 100ms between each quadrant
      setTimeout(() => {
        tweenEngine.to(anim, { scale: 1 }, 600, easeOutBack);
        tweenEngine.to(anim, { opacity: 1 }, 400, easeOut);
        requestFrame();
      }, i * 100);
    }
  }, [tweenEngine, requestFrame]);

  // Handle click: map screen coords to quadrant
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const sx =
        (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
      const sy =
        (e.clientY - rect.top) * (canvas.height / dpr / rect.height);
      const { x: wx, y: wy } = screenToWorld(sx, sy);

      let clickedIdx: number | null = null;
      for (let i = 0; i < QUADRANTS.length; i++) {
        const q = QUADRANTS[i];
        const qx = HEADER_LEFT + q.col * CELL_W + CELL_PAD;
        const qy = HEADER_TOP + q.row * CELL_H + CELL_PAD;
        const qw = CELL_W - CELL_PAD * 2;
        const qh = CELL_H - CELL_PAD * 2;
        if (wx >= qx && wx <= qx + qw && wy >= qy && wy <= qy + qh) {
          clickedIdx = i;
          break;
        }
      }

      if (clickedIdx !== null) {
        const newSelected = clickedIdx === selected ? null : clickedIdx;
        setSelected(newSelected);

        // Animate the selection: scale bounce
        for (let i = 0; i < QUADRANTS.length; i++) {
          const anim = quadAnimsRef.current[i];
          if (i === newSelected) {
            anim.scale = 0.95;
            tweenEngine.to(anim, { scale: 1.04 }, 350, easeOutBack);
          } else {
            tweenEngine.to(anim, { scale: 1 }, 250, easeOut);
          }
        }
        requestFrame();
      }
    },
    [selected, screenToWorld, tweenEngine, requestFrame],
  );

  // Cursor hint
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const sx =
        (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
      const sy =
        (e.clientY - rect.top) * (canvas.height / dpr / rect.height);
      const { x: wx, y: wy } = screenToWorld(sx, sy);

      let overQuad = false;
      for (let i = 0; i < QUADRANTS.length; i++) {
        const q = QUADRANTS[i];
        const qx = HEADER_LEFT + q.col * CELL_W + CELL_PAD;
        const qy = HEADER_TOP + q.row * CELL_H + CELL_PAD;
        const qw = CELL_W - CELL_PAD * 2;
        const qh = CELL_H - CELL_PAD * 2;
        if (wx >= qx && wx <= qx + qw && wy >= qy && wy <= qy + qh) {
          overQuad = true;
          break;
        }
      }
      if (overQuad !== hovering) setHovering(overQuad);
    },
    [hovering, screenToWorld],
  );

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  // Force a redraw after intro tweens complete
  useEffect(() => {
    drawOnce();
  }, [drawOnce]);

  return (
    <div
      className="rounded-lg border bg-card p-4 my-6 overflow-hidden"
      ref={containerRef}
    >
      <div className="text-sm font-medium text-muted-foreground mb-3">
        Four Approaches to AI (Russell &amp; Norvig)
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: hovering ? 'pointer' : 'grab' }}
      />
      {selected !== null && (
        <div className="mt-3 text-sm text-muted-foreground leading-relaxed transition-opacity duration-200">
          {QUADRANTS[selected].description}
        </div>
      )}
    </div>
  );
}
