import { useSyncExternalStore } from 'react';
import { Progress } from '@/components/ui/progress';
import { getExerciseProgress } from '@/hooks/useLabProgress';
import { Check } from 'lucide-react';

interface ExerciseInfo {
  id: string;
  steps: number;
  label: string;
}

interface LabProgressBarProps {
  exercises: ExerciseInfo[];
}

// Simple listener for sessionStorage changes
let listeners: (() => void)[] = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  // Also listen for storage events from other tabs
  const handler = () => cb();
  window.addEventListener('storage', handler);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
    window.removeEventListener('storage', handler);
  };
}

export default function LabProgressBar({ exercises }: LabProgressBarProps) {
  // Force re-render when progress changes
  const snapshot = useSyncExternalStore(subscribe, () => {
    return exercises
      .map((ex) => {
        const p = getExerciseProgress(ex.id, ex.steps);
        return `${p.completed}/${p.total}`;
      })
      .join('|');
  });

  const progresses = snapshot.split('|').map((s) => {
    const [c, t] = s.split('/').map(Number);
    return { completed: c, total: t };
  });

  const totalCompleted = progresses.reduce((s, p) => s + p.completed, 0);
  const totalSteps = progresses.reduce((s, p) => s + p.total, 0);
  const pct = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0;

  return (
    <div className="rounded-lg border bg-card p-4 my-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">Lab Progress</span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2 mb-3" />
      <div className="flex flex-wrap gap-3 text-xs">
        {exercises.map((ex, i) => {
          const p = progresses[i];
          const done = p.completed === p.total;
          return (
            <span
              key={ex.id}
              className={`flex items-center gap-1 ${done ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {done && <Check className="size-3" />}
              {ex.label}: {p.completed}/{p.total}
            </span>
          );
        })}
      </div>
    </div>
  );
}
