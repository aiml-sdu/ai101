import { useRef, useEffect, useCallback, useState } from 'react';
import {
  setupCanvas,
  drawRoundRect,
  drawText,
  drawCircle,
  drawLine,
  getThemeColors,
} from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';

// ---- Constants ----

const WORLD_W = 2400;
const WORLD_H = 400;
const TIMELINE_Y = 200;
const CARD_W = 160;
const CARD_H = 70;
const TOOLTIP_W = 220;
const TOOLTIP_H = 90;

// ---- Data ----

interface Milestone {
  year: number;
  title: string;
  description: string;
}

interface AIWinter {
  startYear: number;
  endYear: number;
  label: string;
}

const MILESTONES: Milestone[] = [
  { year: 1943, title: 'McCulloch-Pitts', description: 'First mathematical model of a neuron' },
  { year: 1950, title: "Turing's Paper", description: 'Can machines think?' },
  { year: 1956, title: 'Dartmouth Conference', description: 'AI born as a field' },
  { year: 1966, title: 'ELIZA', description: 'First chatbot' },
  { year: 1969, title: 'Shakey', description: 'First mobile robot' },
  { year: 1980, title: 'Expert Systems', description: 'Rule-based AI boom' },
  { year: 1997, title: 'Deep Blue', description: 'Beats world chess champion' },
  { year: 2011, title: 'Watson', description: 'Wins Jeopardy!' },
  { year: 2012, title: 'AlexNet', description: 'Deep learning revolution' },
  { year: 2016, title: 'AlphaGo', description: 'Beats Go world champion' },
  { year: 2020, title: 'GPT-3', description: 'Large language models arrive' },
  { year: 2023, title: 'ChatGPT / Claude', description: 'AI goes mainstream' },
];

const AI_WINTERS: AIWinter[] = [
  { startYear: 1974, endYear: 1980, label: 'AI Winter 1' },
  { startYear: 1987, endYear: 1993, label: 'AI Winter 2' },
];

// Map a year to world X coordinate
const YEAR_MIN = 1940;
const YEAR_MAX = 2025;

function yearToX(year: number): number {
  const margin = 80;
  return margin + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (WORLD_W - margin * 2);
}

// ---- Component ----

export default function AITimelineViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fitDoneRef = useRef(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { width: containerW } = useContainerSize(containerRef, { width: 700, height: 350 });
  const displayW = Math.min(containerW - 16, 900);
  const displayH = 350;

  const { camera, fitToView, screenToWorld } = useCanvasCamera(canvasRef);

  // Fit on mount
  useEffect(() => {
    if (displayW > 0 && !fitDoneRef.current) {
      fitToView(displayW, displayH, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
      fitDoneRef.current = true;
    }
  }, [displayW, displayH, fitToView]);

  // Compute card positions (stable reference)
  const cardPositions = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  if (cardPositions.current.length === 0) {
    cardPositions.current = MILESTONES.map((m, i) => {
      const cx = yearToX(m.year);
      const above = i % 2 === 0;
      const cardX = cx - CARD_W / 2;
      const cardY = above ? TIMELINE_Y - 50 - CARD_H : TIMELINE_Y + 50;
      return { x: cardX, y: cardY, w: CARD_W, h: CARD_H };
    });
  }

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayW <= 0) return;

    const ctx = setupCanvas(canvas, displayW, displayH);
    const colors = getThemeColors();

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // -- Background --
    ctx.fillStyle = colors.bg;
    ctx.fillRect(-200, -200, WORLD_W + 400, WORLD_H + 400);

    // -- AI Winter shaded regions --
    for (const winter of AI_WINTERS) {
      const x1 = yearToX(winter.startYear);
      const x2 = yearToX(winter.endYear);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.10)';
      ctx.fillRect(x1, 20, x2 - x1, WORLD_H - 40);

      // Border
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(x1, 20, x2 - x1, WORLD_H - 40);
      ctx.setLineDash([]);

      // Label
      drawText(ctx, winter.label, (x1 + x2) / 2, 40, {
        color: 'rgba(239, 68, 68, 0.6)',
        font: 'italic 12px var(--font-sans, system-ui, sans-serif)',
        align: 'center',
        baseline: 'middle',
      });
    }

    // -- Timeline line --
    drawLine(ctx, yearToX(YEAR_MIN), TIMELINE_Y, yearToX(YEAR_MAX), TIMELINE_Y, colors.border, 2);

    // -- Year markers (every 10 years + 2025) --
    const yearMarks: number[] = [];
    for (let y = 1940; y <= 2020; y += 10) yearMarks.push(y);
    yearMarks.push(2025);

    for (const year of yearMarks) {
      const x = yearToX(year);
      drawLine(ctx, x, TIMELINE_Y - 8, x, TIMELINE_Y + 8, colors.secondary, 1);
      drawText(ctx, String(year), x, TIMELINE_Y + 22, {
        color: colors.secondary,
        font: '11px var(--font-sans, system-ui, sans-serif)',
        align: 'center',
        baseline: 'middle',
      });
    }

    // -- Milestones --
    for (let i = 0; i < MILESTONES.length; i++) {
      const m = MILESTONES[i];
      const cx = yearToX(m.year);
      const above = i % 2 === 0;
      const pos = cardPositions.current[i];
      const isHovered = hoverIndex === i;

      // Connector line from timeline dot to card
      const connectorEndY = above ? pos.y + pos.h : pos.y;
      drawLine(ctx, cx, TIMELINE_Y, cx, connectorEndY, colors.border, 1);

      // Timeline dot
      const dotRadius = isHovered ? 7 : 5;
      drawCircle(ctx, cx, TIMELINE_Y, dotRadius, isHovered ? colors.primary : colors.text, colors.bg);

      // Card
      const cardFill = isHovered ? colors.primary : colors.surface;
      const cardStroke = isHovered ? colors.primary : colors.border;
      drawRoundRect(ctx, pos.x, pos.y, pos.w, pos.h, 6, cardFill, cardStroke);

      // Card text
      const textColor = isHovered ? colors.bg : colors.text;
      const subtitleColor = isHovered ? colors.bg : colors.secondary;

      drawText(ctx, String(m.year), pos.x + pos.w / 2, pos.y + 16, {
        color: subtitleColor,
        font: 'bold 11px var(--font-sans, system-ui, sans-serif)',
        align: 'center',
        baseline: 'middle',
      });
      drawText(ctx, m.title, pos.x + pos.w / 2, pos.y + 34, {
        color: textColor,
        font: 'bold 13px var(--font-sans, system-ui, sans-serif)',
        align: 'center',
        baseline: 'middle',
      });
      drawText(ctx, m.description, pos.x + pos.w / 2, pos.y + 52, {
        color: subtitleColor,
        font: '10px var(--font-sans, system-ui, sans-serif)',
        align: 'center',
        baseline: 'middle',
      });
    }

    // -- Hover tooltip --
    if (hoverIndex !== null) {
      const m = MILESTONES[hoverIndex];
      const pos = cardPositions.current[hoverIndex];
      const above = hoverIndex % 2 === 0;

      const tooltipX = pos.x + pos.w / 2 - TOOLTIP_W / 2;
      const tooltipY = above ? pos.y - TOOLTIP_H - 10 : pos.y + pos.h + 10;

      // Clamp to world bounds
      const clampedX = Math.max(10, Math.min(WORLD_W - TOOLTIP_W - 10, tooltipX));
      const clampedY = Math.max(10, Math.min(WORLD_H - TOOLTIP_H - 10, tooltipY));

      // Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      drawRoundRect(ctx, clampedX, clampedY, TOOLTIP_W, TOOLTIP_H, 8, colors.surface, colors.primary);
      ctx.restore();

      drawText(ctx, String(m.year), clampedX + TOOLTIP_W / 2, clampedY + 18, {
        color: colors.primary,
        font: 'bold 14px var(--font-sans, system-ui, sans-serif)',
        align: 'center',
        baseline: 'middle',
      });
      drawText(ctx, m.title, clampedX + TOOLTIP_W / 2, clampedY + 38, {
        color: colors.text,
        font: 'bold 14px var(--font-sans, system-ui, sans-serif)',
        align: 'center',
        baseline: 'middle',
      });

      // Word-wrap description in tooltip
      const desc = m.description;
      const maxChars = 34;
      if (desc.length <= maxChars) {
        drawText(ctx, desc, clampedX + TOOLTIP_W / 2, clampedY + 58, {
          color: colors.secondary,
          font: '12px var(--font-sans, system-ui, sans-serif)',
          align: 'center',
          baseline: 'middle',
        });
      } else {
        const words = desc.split(' ');
        let line1 = '';
        let line2 = '';
        let onSecond = false;
        for (const word of words) {
          if (!onSecond && (line1 + ' ' + word).trim().length <= maxChars) {
            line1 = (line1 + ' ' + word).trim();
          } else {
            onSecond = true;
            line2 = (line2 + ' ' + word).trim();
          }
        }
        drawText(ctx, line1, clampedX + TOOLTIP_W / 2, clampedY + 54, {
          color: colors.secondary,
          font: '12px var(--font-sans, system-ui, sans-serif)',
          align: 'center',
          baseline: 'middle',
        });
        drawText(ctx, line2, clampedX + TOOLTIP_W / 2, clampedY + 70, {
          color: colors.secondary,
          font: '12px var(--font-sans, system-ui, sans-serif)',
          align: 'center',
          baseline: 'middle',
        });
      }
    }

    ctx.restore();
  }, [displayW, displayH, camera, hoverIndex]);

  // Hover detection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const sx = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
      const sy = (e.clientY - rect.top) * (canvas.height / dpr / rect.height);
      const { x: wx, y: wy } = screenToWorld(sx, sy);

      let found: number | null = null;
      for (let i = 0; i < MILESTONES.length; i++) {
        const pos = cardPositions.current[i];
        if (wx >= pos.x && wx <= pos.x + pos.w && wy >= pos.y && wy <= pos.y + pos.h) {
          found = i;
          break;
        }
        // Also check the dot on the timeline
        const dotX = yearToX(MILESTONES[i].year);
        const dist = Math.hypot(wx - dotX, wy - TIMELINE_Y);
        if (dist <= 10) {
          found = i;
          break;
        }
      }
      setHoverIndex(found);
    },
    [screenToWorld],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        History of AI (1943 - 2025) &mdash; drag to pan, scroll to zoom
      </div>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: hoverIndex !== null ? 'pointer' : 'grab' }}
      />
    </div>
  );
}
