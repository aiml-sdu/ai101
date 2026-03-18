import { useEffect, useMemo, useRef, useState } from 'react';
import AlgoControls from '@/components/AlgoControls';
import {
  collectAC3Steps,
  createAustraliaMapCSP,
  type AC3Arc,
  type AustraliaColor,
  type AustraliaVariable,
  type DomainMap,
} from '@/lib/csp';
import { AustraliaConstraintGraph, domainLabel } from './CSPShared';

function initialDomains(): DomainMap<AustraliaColor> {
  return {
    WA: ['red'],
    NT: ['green'],
    SA: ['red', 'green', 'blue'],
    Q: ['red', 'green', 'blue'],
    NSW: ['red', 'green', 'blue'],
    V: ['red', 'green', 'blue'],
    T: ['red', 'green', 'blue'],
  };
}

const INITIAL_QUEUE: AC3Arc[] = [
  { from: 'SA', to: 'WA' },
  { from: 'SA', to: 'NT' },
  { from: 'Q', to: 'NT' },
];

export default function AC3StepViz() {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const { steps } = useMemo(
    () => collectAC3Steps(problem, initialDomains(), INITIAL_QUEUE),
    [problem],
  );

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(200, 850 / speed));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed, steps.length]);

  const step = steps[index];
  const activeRegion = (step.arc?.from ?? 'SA') as AustraliaVariable;
  const assignment = Object.fromEntries(
    Object.entries(step.domains).flatMap(([variable, values]) => values.length === 1 ? [[variable, values[0]]] : []),
  ) as Partial<Record<AustraliaVariable, AustraliaColor>>;

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">AC-3 propagation trace</h3>
          <p className="text-sm text-muted-foreground">
            Start with two fixed regions, then watch arc consistency prune the remaining domains.
          </p>
        </div>
        <div className="rounded-full border px-3 py-1 text-xs font-medium">
          Step {index + 1} / {steps.length}
        </div>
      </div>

      <AlgoControls
        playing={playing}
        canStepBack={index > 0}
        canStepForward={index < steps.length - 1}
        speed={speed}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onStep={() => setIndex((prev) => Math.min(prev + 1, steps.length - 1))}
        onStepBack={() => setIndex((prev) => Math.max(prev - 1, 0))}
        onReset={() => {
          setPlaying(false);
          setIndex(0);
        }}
        onSpeedChange={setSpeed}
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <AustraliaConstraintGraph
          assignment={assignment}
          problem={problem}
          domains={step.domains}
          activeRegion={activeRegion}
        />

        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="font-semibold">Current action</div>
            <p className="mt-2 text-muted-foreground">{step.message}</p>
            {step.arc && (
              <p className="mt-2 font-medium">
                Active arc: {step.arc.from} → {step.arc.to}
              </p>
            )}
            {step.pruned && (
              <p className="mt-2 text-emerald-700 dark:text-emerald-300">
                Removed from {step.pruned.variable}: {step.pruned.removed.join(', ')}
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Queue</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {step.queue.length > 0 ? step.queue.map((arc, arcIndex) => (
                <span key={`${arc.from}-${arc.to}-${arcIndex}`} className="rounded-full border px-2 py-1 text-xs">
                  {arc.from} → {arc.to}
                </span>
              )) : (
                <span className="text-muted-foreground">Queue empty</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Domains</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.entries(step.domains) as [AustraliaVariable, AustraliaColor[]][])
                .map(([variable, values]) => (
                  <div key={variable} className="rounded-lg border bg-muted/20 px-3 py-2">
                    <div className="font-medium">{variable}</div>
                    <div className={values.length === 0 ? 'text-red-600 dark:text-red-300' : 'text-muted-foreground'}>
                      {domainLabel(values)}
                    </div>
                  </div>
                ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Revisions: {step.revisions} | Consistency checks: {step.checks}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
