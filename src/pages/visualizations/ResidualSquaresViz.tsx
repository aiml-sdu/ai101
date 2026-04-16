import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import { generateLinearData, mae, mse, olsFit, type Point } from '@/lib/regression-math';

const VB_W = 720;
const VB_H = 420;
const PAD = { top: 28, right: 36, bottom: 52, left: 60 };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getBounds(points: Point[], w: number, b: number) {
  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  yValues.push(w * xMin + b, w * xMax + b);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  return {
    xMin: xMin - 0.6,
    xMax: xMax + 0.6,
    yMin: Math.max(0, yMin - 5),
    yMax: yMax + 5,
  };
}

export default function ResidualSquaresViz() {
  const basePoints = useMemo(
    () => generateLinearData(8, 2.4, 12, 3.4, 17).sort((a, b) => a.x - b.x),
    [],
  );
  const adjustableIndex = 5;
  const [mode, setMode] = useState<'absolute' | 'squared'>('absolute');
  const [dragging, setDragging] = useState(false);
  const [outlierY, setOutlierY] = useState(() => basePoints[adjustableIndex].y);
  const svgRef = useRef<SVGSVGElement>(null);

  const points = useMemo(
    () => basePoints.map((point, index) => (index === adjustableIndex ? { ...point, y: outlierY } : point)),
    [basePoints, outlierY],
  );
  const fit = useMemo(() => olsFit(points), [points]);
  const bounds = useMemo(() => getBounds(points, fit.w, fit.b), [points, fit]);

  const plotW = VB_W - PAD.left - PAD.right;
  const plotH = VB_H - PAD.top - PAD.bottom;

  const sx = useCallback(
    (x: number) => PAD.left + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * plotW,
    [bounds.xMax, bounds.xMin, plotW],
  );
  const sy = useCallback(
    (y: number) => PAD.top + plotH - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * plotH,
    [bounds.yMax, bounds.yMin, plotH],
  );
  const invSy = useCallback(
    (svgY: number) => bounds.yMin + ((PAD.top + plotH - svgY) / plotH) * (bounds.yMax - bounds.yMin),
    [bounds.yMax, bounds.yMin, plotH],
  );

  const mseScore = useMemo(() => mse(points, fit.w, fit.b), [points, fit]);
  const maeScore = useMemo(() => mae(points, fit.w, fit.b), [points, fit]);

  const updateDraggedPoint = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!dragging || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scale = VB_W / rect.width;
      const svgY = (event.clientY - rect.top) * scale;
      setOutlierY(clamp(invSy(svgY), 0, 55));
    },
    [dragging, invSy],
  );

  const resetOutlier = () => {
    setOutlierY(basePoints[adjustableIndex].y);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'absolute' ? 'default' : 'outline'}
            onClick={() => setMode('absolute')}
          >
            Absolute Error
          </Button>
          <Button
            size="sm"
            variant={mode === 'squared' ? 'default' : 'outline'}
            onClick={() => setMode('squared')}
          >
            Squared Error
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={resetOutlier}>
          Reset outlier
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MAE</div>
          <div className="mt-1 text-2xl font-semibold">{maeScore.toFixed(2)}</div>
          <div className="mt-1 text-sm text-muted-foreground">Average absolute residual height</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MSE</div>
          <div className="mt-1 text-2xl font-semibold">{mseScore.toFixed(2)}</div>
          <div className="mt-1 text-sm text-muted-foreground">Large misses get amplified after squaring</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Try this</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Drag the highlighted point up or down and watch how the line and the error summary react.
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full touch-none"
          onPointerMove={updateDraggedPoint}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
        >
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={1} />
          <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={1} />

          <text x={PAD.left + plotW / 2} y={VB_H - 10} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12}>
            Feature value
          </text>
          <text
            x={18}
            y={PAD.top + plotH / 2}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize={12}
            transform={`rotate(-90, 18, ${PAD.top + plotH / 2})`}
          >
            Target value
          </text>

          {[2, 4, 6, 8].map((x) => (
            <g key={`x-${x}`}>
              <line x1={sx(x)} y1={PAD.top} x2={sx(x)} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={sx(x)} y={PAD.top + plotH + 18} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>
                {x}
              </text>
            </g>
          ))}

          {[10, 20, 30, 40, 50].map((y) => (
            <g key={`y-${y}`}>
              <line x1={PAD.left} y1={sy(y)} x2={PAD.left + plotW} y2={sy(y)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={sy(y) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>
                {y}
              </text>
            </g>
          ))}

          <line
            x1={sx(bounds.xMin)}
            y1={sy(fit.w * bounds.xMin + fit.b)}
            x2={sx(bounds.xMax)}
            y2={sy(fit.w * bounds.xMax + fit.b)}
            stroke="var(--primary)"
            strokeWidth={3}
          />

          {points.map((point, index) => {
            const predictedY = fit.w * point.x + fit.b;
            const pointPxY = sy(point.y);
            const predictedPxY = sy(predictedY);
            const residualPx = Math.abs(pointPxY - predictedPxY);
            const top = Math.min(pointPxY, predictedPxY);
            const x = sx(point.x);
            const isDraggable = index === adjustableIndex;

            return (
              <g key={`${point.x}-${index}`}>
                <line
                  x1={x}
                  y1={pointPxY}
                  x2={x}
                  y2={predictedPxY}
                  stroke="var(--color-warning)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  opacity={0.9}
                />

                {mode === 'absolute' ? (
                  <rect
                    x={x - 5}
                    y={top}
                    width={10}
                    height={Math.max(2, residualPx)}
                    fill="var(--color-info)"
                    opacity={0.35}
                    rx={2}
                  />
                ) : (
                  <rect
                    x={clamp(x + 10, PAD.left, PAD.left + plotW - Math.max(8, residualPx))}
                    y={clamp(top, PAD.top, PAD.top + plotH - Math.max(8, residualPx))}
                    width={Math.max(8, residualPx)}
                    height={Math.max(8, residualPx)}
                    fill="var(--color-error)"
                    opacity={0.22}
                    rx={4}
                  />
                )}

                <circle cx={x} cy={predictedPxY} r={3.5} fill="white" stroke="var(--primary)" strokeWidth={2} />
                <circle
                  cx={x}
                  cy={pointPxY}
                  r={isDraggable ? 7 : 5}
                  fill={isDraggable ? 'var(--color-error)' : 'var(--foreground)'}
                  stroke="white"
                  strokeWidth={2}
                  className={isDraggable ? 'cursor-grab active:cursor-grabbing' : undefined}
                  onPointerDown={(event) => {
                    if (!isDraggable) return;
                    event.preventDefault();
                    setDragging(true);
                  }}
                />
                {isDraggable && (
                  <text x={x + 14} y={pointPxY - 10} fill="var(--color-error)" fontSize={11} fontWeight={600}>
                    drag me
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
        {mode === 'absolute'
          ? 'Absolute error uses the vertical gap itself. Every miss grows linearly with residual size.'
          : 'Squared error uses a square whose side is the residual. A big outlier creates a much larger area, so MSE reacts strongly.'}
      </div>
    </div>
  );
}
