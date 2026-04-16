import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import { M, BlockMath } from '@/components/Math';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CARDS,
  QUIZ_101,
  QUIZ_102,
  QUIZ_103,
  QUIZ_104,
  SECTIONS,
} from '@/data/topic-10-cards';
import { generateLinearData, olsFit } from '@/lib/regression-math';

const FitTheLineGame = lazy(() => import('./visualizations/FitTheLineGame'));
const ResidualSquaresViz = lazy(() => import('./visualizations/ResidualSquaresViz'));

const PARADIGM_THEME = {
  unsupervised: {
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/40',
    active: 'border-amber-500 bg-amber-500/10',
  },
  reinforcement: {
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/40',
    active: 'border-emerald-500 bg-emerald-500/10',
  },
  supervised: {
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/40',
    active: 'border-blue-500 bg-blue-500/10',
  },
} as const;

function VizLoading() {
  return (
    <div className="flex h-64 items-center justify-center rounded-3xl bg-muted text-sm text-muted-foreground animate-pulse">
      Loading visualization...
    </div>
  );
}

interface ChoiceOption {
  id: string;
  label: string;
  detail?: string;
  correct: boolean;
  explanation: string;
}

interface ChoiceExerciseProps {
  prompt: string;
  options: ChoiceOption[];
  onComplete: () => void;
  supporting?: ReactNode;
}

function ChoiceExercise({ prompt, options, onComplete, supporting }: ChoiceExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const choice = options.find((option) => option.id === selected);
  const correct = !!choice?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (correct) {
      setTimeout(onComplete, 350);
    }
  };

  return (
    <div className="space-y-4">
      {supporting}
      <p>{prompt}</p>
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => !submitted && setSelected(option.id)}
            disabled={submitted}
            className={cn(
              'rounded-2xl border p-4 text-left transition-colors',
              selected === option.id && !submitted && 'border-primary bg-primary/5',
              submitted && option.correct && 'border-green-500 bg-green-500/10',
              submitted && selected === option.id && !option.correct && 'border-red-500 bg-red-500/10',
              !submitted && selected !== option.id && 'hover:bg-muted/50',
            )}
          >
            <div className="font-medium">{option.label}</div>
            {option.detail && (
              <div className="mt-1 text-sm text-muted-foreground">{option.detail}</div>
            )}
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit} disabled={!selected}>
          Check
        </Button>
      ) : (
        <div className="space-y-2">
          <div
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              correct
                ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300',
            )}
          >
            {choice?.explanation}
          </div>
          {!correct && (
            <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Tag({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'blue' | 'emerald' | 'amber' | 'violet';
}) {
  const styles = {
    default: 'bg-muted text-muted-foreground',
    blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    violet: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  } as const;

  return (
    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', styles[tone])}>
      {label}
    </span>
  );
}

function PriceGuessHookContent({ onComplete }: { onComplete: () => void }) {
  const points = useMemo(() => generateLinearData(15, 3.2, 20, 12, 99), []);
  const [guess, setGuess] = useState<number | null>(null);
  const ols = useMemo(() => olsFit(points), [points]);
  const targetX = 7.5;
  const trueY = ols.w * targetX + ols.b;

  useEffect(() => {
    if (guess !== null) {
      onComplete();
    }
  }, [guess, onComplete]);

  const VB_W = 600;
  const VB_H = 340;
  const PAD = { top: 20, right: 30, bottom: 50, left: 60 };
  const plotW = VB_W - PAD.left - PAD.right;
  const plotH = VB_H - PAD.top - PAD.bottom;
  const xMin = 0;
  const xMax = 10;
  const yMin = 0;
  const yMax = 70;
  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => PAD.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    if (guess !== null) return;
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scale = VB_W / rect.width;
    const clickY = (event.clientY - rect.top) * scale;
    const dataY = yMin + ((PAD.top + plotH - clickY) / plotH) * (yMax - yMin);
    setGuess(Math.max(yMin, Math.min(yMax, dataY)));
  };

  return (
    <div className="space-y-4">
      <p>
        This is the core regression move: you see examples, then try to predict a new number. Click on the chart to guess the price for the marked house.
      </p>
      <Surface className="overflow-hidden p-0">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full cursor-crosshair"
          onClick={handleClick}
        >
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={1} />
          <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={1} />
          <text x={PAD.left + plotW / 2} y={VB_H - 8} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12}>Size</text>
          <text
            x={14}
            y={PAD.top + plotH / 2}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize={12}
            transform={`rotate(-90, 14, ${PAD.top + plotH / 2})`}
          >
            Price
          </text>
          {[2, 4, 6, 8].map((x) => (
            <g key={`gx-${x}`}>
              <line x1={sx(x)} y1={PAD.top} x2={sx(x)} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={sx(x)} y={PAD.top + plotH + 16} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>{x}</text>
            </g>
          ))}
          {[10, 20, 30, 40, 50, 60].map((y) => (
            <g key={`gy-${y}`}>
              <line x1={PAD.left} y1={sy(y)} x2={PAD.left + plotW} y2={sy(y)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={sy(y) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>{y}</text>
            </g>
          ))}
          <line x1={sx(targetX)} y1={PAD.top} x2={sx(targetX)} y2={PAD.top + plotH} stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.55} />
          <text x={sx(targetX)} y={PAD.top - 6} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={600}>new house</text>
          {points.map((point, index) => (
            <circle key={index} cx={sx(point.x)} cy={sy(point.y)} r={4.5} fill="var(--primary)" opacity={0.7} />
          ))}
          {guess !== null && (
            <>
              <circle cx={sx(targetX)} cy={sy(guess)} r={7} fill="var(--color-error)" stroke="white" strokeWidth={2} />
              <line
                x1={sx(xMin)}
                y1={sy(ols.w * xMin + ols.b)}
                x2={sx(xMax)}
                y2={sy(ols.w * xMax + ols.b)}
                stroke="var(--color-success)"
                strokeWidth={2}
                opacity={0.8}
              />
              <circle cx={sx(targetX)} cy={sy(trueY)} r={7} fill="var(--color-success)" stroke="white" strokeWidth={2} />
            </>
          )}
        </svg>
      </Surface>
      {guess !== null && (
        <CalloutBox
          type={Math.abs(guess - trueY) < 8 ? 'tip' : 'info'}
          title={Math.abs(guess - trueY) < 8 ? 'Nice estimate' : 'That gap is the lesson'}
        >
          <p>
            You guessed <strong>{guess.toFixed(1)}</strong>. The best-fit line predicts <strong>{trueY.toFixed(1)}</strong>.
            Regression is the supervised-learning setup where we learn this mapping from examples instead of hand-writing price rules.
          </p>
        </CalloutBox>
      )}
    </div>
  );
}

function MLDefinitionHook({ onComplete }: { onComplete: () => void }) {
  const prompts = [
    {
      id: 'spam',
      title: 'Filter spam emails',
      prompt: 'Millions of messages, messy language, and new tricks every week.',
      answer: 'learn',
      explanation: 'This is a learning problem. Writing fixed rules for every spam tactic breaks down quickly.',
    },
    {
      id: 'tax',
      title: 'Apply a tax bracket table',
      prompt: 'The thresholds are explicit and the logic is fixed by policy.',
      answer: 'rules',
      explanation: 'This is a rule-driven task. The logic is explicit, stable, and easy to hand-code.',
    },
    {
      id: 'chess',
      title: 'Choose strong chess moves',
      prompt: 'Too many board states to hand-code all good decisions.',
      answer: 'learn',
      explanation: 'This is the lecture’s experience-driven case: learn from rewards and outcomes instead of enumerating every rule.',
    },
    {
      id: 'turnstile',
      title: 'Open a turnstile',
      prompt: 'If the ticket is valid, unlock. If not, stay closed.',
      answer: 'rules',
      explanation: 'This logic is crisp and explicit. No learning system is needed.',
    },
  ] as const;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [didComplete, setDidComplete] = useState(false);
  const allAnswered = prompts.every((prompt) => answers[prompt.id]);

  useEffect(() => {
    if (allAnswered && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [allAnswered, didComplete, onComplete]);

  return (
    <div className="space-y-4">
      <p>
        Before the formal definition, start with a sharper question: <strong>should we hand-write rules, or should the system learn from experience?</strong>
      </p>
      <Surface>
        <div className="flex flex-wrap items-center gap-2">
          <Tag label="Problem first" tone="violet" />
          <Tag label="Rules vs experience" tone="blue" />
        </div>
        <div className="mt-4 grid gap-4">
          {prompts.map((prompt) => {
            const selected = answers[prompt.id];
            const correct = selected === prompt.answer;
            return (
              <div
                key={prompt.id}
                className={cn(
                  'rounded-2xl border p-4 transition-colors',
                  selected && correct && 'border-green-500/40 bg-green-500/5',
                  selected && !correct && 'border-red-500/40 bg-red-500/5',
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <div className="text-sm font-semibold">{prompt.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{prompt.prompt}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ['rules', 'Write explicit rules'],
                      ['learn', 'Learn from experience'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [prompt.id]: value }))}
                        className={cn(
                          'rounded-full border px-3 py-2 text-sm transition-colors',
                          selected === value ? 'border-primary bg-primary/10' : 'hover:bg-muted/60',
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mt-3 rounded-xl px-3 py-2 text-sm',
                      correct
                        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 text-red-700 dark:text-red-300',
                    )}
                  >
                    {prompt.explanation}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </Surface>
      {allAnswered && (
        <Surface className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Lecture definition
            </div>
            <div className="mt-3 text-lg font-semibold">
              Getting a computer to do well on a task without explicitly programming it.
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Experience matters
            </div>
            <div className="mt-3 text-lg font-semibold">
              Improving performance on a task based on experience.
            </div>
          </div>
        </Surface>
      )}
    </div>
  );
}

function ParadigmPlayground({ onComplete }: { onComplete: () => void }) {
  const scenarios = [
    {
      id: 'cluster',
      title: 'Cluster unlabeled data',
      prompt: 'You only have raw measurements and want to group similar examples together.',
      answer: 'unsupervised',
      explanation: 'Unsupervised learning is about structure in unlabeled data: clustering, outliers, generation, and filling in missing data.',
    },
    {
      id: 'chess',
      title: 'Learn chess from rewards',
      prompt: 'The agent sees board states, makes moves, and gets rewards from what happens next.',
      answer: 'reinforcement',
      explanation: 'Reinforcement learning uses states, actions, and rewards. The chess example in the slide is the template.',
    },
    {
      id: 'price',
      title: 'Predict from paired examples',
      prompt: 'Each house already has features and a known selling price.',
      answer: 'supervised',
      explanation: 'Supervised learning uses paired input/output data. Topic 10 follows this branch and then zooms in on regression.',
    },
  ] as const;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [didComplete, setDidComplete] = useState(false);
  const allAnswered = scenarios.every((scenario) => answers[scenario.id]);

  useEffect(() => {
    if (allAnswered && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [allAnswered, didComplete, onComplete]);

  return (
    <div className="space-y-4">
      <p>
        The lecture immediately splits ML into three big paradigms. The point is not the model name yet. The point is <strong>what kind of feedback the learner gets</strong>.
      </p>
      <Surface>
        <div className="grid gap-2 md:grid-cols-3">
          <div className={cn('rounded-2xl border px-4 py-3', PARADIGM_THEME.unsupervised.border)}>
            <div className="text-sm font-semibold">Unsupervised</div>
            <div className="mt-1 text-xs text-muted-foreground">No labels, find structure</div>
          </div>
          <div className={cn('rounded-2xl border px-4 py-3', PARADIGM_THEME.reinforcement.border)}>
            <div className="text-sm font-semibold">Reinforcement</div>
            <div className="mt-1 text-xs text-muted-foreground">Actions and rewards over time</div>
          </div>
          <div className={cn('rounded-2xl border px-4 py-3', PARADIGM_THEME.supervised.border)}>
            <div className="text-sm font-semibold">Supervised</div>
            <div className="mt-1 text-xs text-muted-foreground">Paired input and output</div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {scenarios.map((scenario) => {
            const selected = answers[scenario.id];
            const correct = selected === scenario.answer;
            return (
              <div key={scenario.id} className="rounded-2xl border p-4">
                <div className="text-sm font-semibold">{scenario.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{scenario.prompt}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {([
                    ['unsupervised', 'Unsupervised'],
                    ['reinforcement', 'Reinforcement'],
                    ['supervised', 'Supervised'],
                  ] as const).map(([value, label]) => {
                    const theme = PARADIGM_THEME[value];
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [scenario.id]: value }))}
                        className={cn(
                          'rounded-full border px-3 py-2 text-sm transition-colors',
                          theme.border,
                          selected === value ? theme.active : 'hover:bg-muted/60',
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mt-3 rounded-xl px-3 py-2 text-sm',
                      correct
                        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 text-red-700 dark:text-red-300',
                    )}
                  >
                    {scenario.explanation}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </Surface>
    </div>
  );
}

function ReinforcementLoopGame({ onComplete }: { onComplete: () => void }) {
  const paths = {
    exploit: {
      label: 'Repeat the known opening',
      mode: 'Exploit',
      immediateReward: '+2 now',
      nextState: 'Predictable middlegame',
      delayedReward: '+1 later',
      summary: 'You cash in a small immediate reward, but you learn very little about better options.',
    },
    explore: {
      label: 'Try a new opening line',
      mode: 'Explore',
      immediateReward: '0 now',
      nextState: 'Unfamiliar but promising position',
      delayedReward: '+4 later',
      summary: 'No reward arrives immediately, but the delayed reward is larger once the new line starts working.',
    },
  } as const;
  const [selectedId, setSelectedId] = useState<keyof typeof paths | null>(null);
  const [didComplete, setDidComplete] = useState(false);
  const selected = selectedId ? paths[selectedId] : null;

  useEffect(() => {
    if (selectedId && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, selectedId]);

  return (
    <div className="space-y-4">
      <p>
        RL is different because the agent must <strong>act to collect data</strong>. The hard part is that rewards can arrive later, so it is not always obvious which action deserved the credit.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Opening state
              </div>
              <div className="mt-2 text-lg font-semibold">Choose one move</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Do you exploit the safe move you already trust, or explore a new line that might pay off later?
              </div>
            </div>
            {(Object.entries(paths) as [keyof typeof paths, (typeof paths)[keyof typeof paths]][]).map(([key, path]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedId(key)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  selectedId === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{path.label}</div>
                  <Tag label={path.mode} tone={key === 'exploit' ? 'amber' : 'emerald'} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Immediate reward: {path.immediateReward}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {'State -> action -> reward -> next state'}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                { title: 'State', value: 'Opening board' },
                { title: 'Action', value: selected ? selected.label : 'Pick a move' },
                { title: 'Reward', value: selected ? selected.immediateReward : '?' },
                { title: 'Next state', value: selected ? selected.nextState : '?' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0.4, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl border p-3"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.title}
                  </div>
                  <div className="mt-2 text-sm font-medium">{item.value}</div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedId ?? 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 rounded-2xl border bg-muted/40 p-4"
              >
                {selected ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Tag label={selected.mode === 'Explore' ? 'Exploration vs exploitation' : 'Greedy now'} tone={selected.mode === 'Explore' ? 'emerald' : 'amber'} />
                      <Tag label={`Delayed reward: ${selected.delayedReward}`} tone="violet" />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{selected.summary}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pick an action to watch the reward story unfold. The slide’s chess example is exactly this loop.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Surface>
      <CalloutBox type="info" title="Why RL Is Hard">
        <p>
          The same action may not lead to the same outcome every time, and good rewards can arrive much later. That is the exploration-exploitation trade-off plus the temporal credit-assignment problem from the lecture.
        </p>
      </CalloutBox>
    </div>
  );
}

function SupervisedModelExplorer({ onComplete }: { onComplete: () => void }) {
  const samples = [
    { age: 5, height: 108 },
    { age: 7, height: 119 },
    { age: 9, height: 132 },
    { age: 11, height: 145 },
    { age: 13, height: 155 },
  ] as const;
  const candidates = [
    {
      id: 'flat',
      label: 'Too flat',
      equation: 'y = 3x + 95',
      slope: 3,
      intercept: 95,
      color: 'var(--color-warning)',
      verdict: 'This family member misses the upward trend. It stays too flat as age increases.',
    },
    {
      id: 'fit',
      label: 'Best fit in this family',
      equation: 'y = 6x + 78',
      slope: 6,
      intercept: 78,
      color: 'var(--primary)',
      verdict: 'This candidate tracks the training points well. Learning means choosing this kind of equation from the family.',
    },
    {
      id: 'steep',
      label: 'Too steep',
      equation: 'y = 9x + 60',
      slope: 9,
      intercept: 60,
      color: 'var(--color-error)',
      verdict: 'This equation rises too quickly. It still belongs to the family, but it does not fit the training data well.',
    },
  ] as const;
  const [selectedId, setSelectedId] = useState<(typeof candidates)[number]['id'] | null>(null);
  const [didComplete, setDidComplete] = useState(false);
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[1];

  useEffect(() => {
    if (selectedId && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, selectedId]);

  const averageResidual = (
    samples.reduce(
      (sum, sample) => sum + Math.abs(selected.slope * sample.age + selected.intercept - sample.height),
      0,
    ) / samples.length
  ).toFixed(1);

  const VB_W = 540;
  const VB_H = 280;
  const PAD = { top: 20, right: 24, bottom: 44, left: 52 };
  const plotW = VB_W - PAD.left - PAD.right;
  const plotH = VB_H - PAD.top - PAD.bottom;
  const xMin = 4;
  const xMax = 14;
  const yMin = 95;
  const yMax = 170;
  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => PAD.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  return (
    <div className="space-y-4">
      <p>
        The supervised-learning slide uses one clean idea: search through a <strong>family of possible equations</strong>, then keep the one that fits the paired data best.
      </p>
      <Surface>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border bg-background/70 p-4">
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full">
              <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="var(--border)" />
              <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke="var(--border)" />
              <text x={PAD.left + plotW / 2} y={VB_H - 8} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12}>Age</text>
              <text
                x={16}
                y={PAD.top + plotH / 2}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize={12}
                transform={`rotate(-90, 16, ${PAD.top + plotH / 2})`}
              >
                Height
              </text>
              {candidates.map((candidate) => (
                <line
                  key={candidate.id}
                  x1={sx(xMin)}
                  y1={sy(candidate.slope * xMin + candidate.intercept)}
                  x2={sx(xMax)}
                  y2={sy(candidate.slope * xMax + candidate.intercept)}
                  stroke={candidate.color}
                  strokeWidth={selected.id === candidate.id ? 4 : 2}
                  opacity={selected.id === candidate.id ? 1 : 0.18}
                  strokeLinecap="round"
                />
              ))}
              {samples.map((sample) => {
                const predicted = selected.slope * sample.age + selected.intercept;
                return (
                  <g key={`${sample.age}-${sample.height}`}>
                    <line
                      x1={sx(sample.age)}
                      y1={sy(predicted)}
                      x2={sx(sample.age)}
                      y2={sy(sample.height)}
                      stroke="var(--color-warning)"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      opacity={0.7}
                    />
                    <circle cx={sx(sample.age)} cy={sy(sample.height)} r={6} fill="white" stroke="var(--primary)" strokeWidth={2.5} />
                    <circle cx={sx(sample.age)} cy={sy(predicted)} r={4.5} fill={selected.color} />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Family of candidate equations
            </div>
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedId(candidate.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  selected.id === candidate.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{candidate.label}</div>
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: candidate.color }}
                  />
                </div>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{candidate.equation}</div>
              </button>
            ))}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border bg-background/70 p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Residual check
                </div>
                <div className="mt-2 text-sm font-semibold">{selected.label}</div>
                <p className="mt-2 text-sm text-muted-foreground">{selected.verdict}</p>
                <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  Average training residual: <strong>{averageResidual}</strong>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function OutputPreview({ taskId }: { taskId: string }) {
  if (taskId === 'price') {
    return (
      <div className="space-y-3">
        <div className="text-3xl font-semibold text-primary">$425k</div>
        <div className="h-2 rounded-full bg-primary/15">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  if (taskId === 'sentiment') {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-muted px-3 py-1 text-xs">NEGATIVE</span>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">POSITIVE</span>
      </div>
    );
  }

  if (taskId === 'music') {
    return (
      <div className="space-y-3">
        <div className="flex h-16 items-end gap-1">
          {[12, 32, 18, 40, 28, 46, 26, 36, 16, 30].map((height, index) => (
            <div
              key={index}
              className={cn('w-4 rounded-t-md', index === 5 ? 'bg-primary' : 'bg-primary/35')}
              style={{ height }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['Jazz', 'Rock', 'Classical', 'Pop'].map((label, index) => (
            <span
              key={label}
              className={cn(
                'rounded-full px-3 py-1 text-xs',
                index === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (taskId === 'segmentation') {
    return (
      <div className="grid w-fit grid-cols-6 gap-1">
        {Array.from({ length: 24 }, (_, index) => (
          <div
            key={index}
            className={cn(
              'size-4 rounded-sm',
              index % 6 === 2 || index % 6 === 3 || index > 15 ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
    );
  }

  if (taskId === 'translation') {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-muted px-4 py-3 text-sm">Hello, how are you?</div>
        <div className="flex justify-center text-muted-foreground">↓</div>
        <div className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          Hej, hvordan har du det?
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {['Cat', 'Dog', 'Car', 'Bike'].map((label, index) => (
        <span
          key={label}
          className={cn(
            'rounded-full px-3 py-1 text-xs',
            index === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted',
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function OutputTypeArcade({ onComplete }: { onComplete: () => void }) {
  const rounds = [
    {
      id: 'price',
      title: 'Predict a house price',
      prompt: 'The model outputs one numeric value.',
      answer: 'univariate-regression',
      why: 'One number means univariate regression.',
    },
    {
      id: 'sentiment',
      title: 'Label a review as positive or negative',
      prompt: 'The model chooses between exactly two classes.',
      answer: 'binary-classification',
      why: 'Two discrete classes means binary classification.',
    },
    {
      id: 'music',
      title: 'Choose one music genre',
      prompt: 'The model picks one label from many classes.',
      answer: 'multiclass-classification',
      why: 'Many discrete classes means multiclass classification.',
    },
    {
      id: 'segmentation',
      title: 'Label many pixels at once',
      prompt: 'The model produces lots of outputs across the image.',
      answer: 'multivariate-output',
      why: 'Many outputs at the same time makes this a multivariate output problem.',
    },
  ] as const;
  const options = [
    { id: 'univariate-regression', label: 'Univariate regression' },
    { id: 'binary-classification', label: 'Binary classification' },
    { id: 'multiclass-classification', label: 'Multiclass classification' },
    { id: 'multivariate-output', label: 'Multivariate output' },
  ] as const;
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [didComplete, setDidComplete] = useState(false);
  const round = rounds[index];

  const handleCheck = () => {
    if (!selectedId) return;
    const correct = selectedId === round.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      if (index === rounds.length - 1) {
        if (!didComplete) {
          setDidComplete(true);
          onComplete();
        }
      } else {
        window.setTimeout(() => {
          setIndex((prev) => prev + 1);
          setSelectedId(null);
          setFeedback(null);
        }, 500);
      }
    }
  };

  return (
    <div className="space-y-4">
      <p>
        The key distinction is <strong>what the model predicts</strong>. Ignore the model family for a moment and classify the output itself.
      </p>
      <Surface>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {rounds.map((item, itemIndex) => (
              <div
                key={item.id}
                className={cn(
                  'size-2.5 rounded-full',
                  itemIndex < index || (itemIndex === index && feedback === 'correct')
                    ? 'bg-primary'
                    : itemIndex === index
                      ? 'bg-primary/40'
                      : 'bg-muted',
                )}
              />
            ))}
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Output Type Arcade
          </div>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current prediction
            </div>
            <h3 className="mt-2 text-xl font-semibold">{round.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{round.prompt}</p>
            <div className="mt-5 rounded-[22px] border bg-card/70 p-5">
              <OutputPreview taskId={round.id} />
            </div>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  selectedId === option.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="font-semibold">{option.label}</div>
              </button>
            ))}

            <div className="pt-1">
              {!feedback ? (
                <Button size="sm" onClick={handleCheck} disabled={!selectedId}>
                  Check framing
                </Button>
              ) : (
                <div
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm',
                    feedback === 'correct'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300',
                  )}
                >
                  {feedback === 'correct'
                    ? round.why
                    : 'Not quite. Focus on the output itself: a number, two classes, many classes, or many outputs.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function TrainTestSplitExplorer({ onComplete }: { onComplete: () => void }) {
  const supporting = (
    <Surface className="p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Raw dataset</div>
          <div className="mt-1 text-sm text-muted-foreground">Paired inputs and known targets</div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="rounded-2xl border border-blue-500/40 bg-blue-500/5 p-4">
          <div className="text-sm font-semibold">Train split</div>
          <div className="mt-1 text-sm text-muted-foreground">Fit the model parameters</div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Model</div>
          <div className="mt-1 text-sm text-muted-foreground">Learned from the train split</div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="text-sm font-semibold">Test split</div>
          <div className="mt-1 text-sm text-muted-foreground">Check unseen performance</div>
        </div>
      </div>
    </Surface>
  );

  return (
    <ChoiceExercise
      prompt="Which split tells you whether the model works on unseen data?"
      supporting={supporting}
      options={[
        {
          id: 'test',
          label: 'The test split',
          detail: 'Use it after training to estimate generalization',
          correct: true,
          explanation: 'Correct. Test data is held out so the model cannot fit itself to those exact examples first.',
        },
        {
          id: 'train',
          label: 'The train split',
          detail: 'The model has already optimized around these examples',
          correct: false,
          explanation: 'Training data can look deceptively good because the model already saw it while learning.',
        },
        {
          id: 'both',
          label: 'Combine train and test first',
          detail: 'That leaks the answer into the evaluation',
          correct: false,
          explanation: 'Mixing them destroys the whole point of a held-out check.',
        },
      ]}
      onComplete={onComplete}
    />
  );
}

function DeepLearningDomainAtlas({ onComplete }: { onComplete: () => void }) {
  const tasks = [
    {
      id: 'house-price',
      title: 'House price',
      description: 'Predict the selling price of a home from its features.',
      outputType: 'Regression · continuous value',
      model: 'Fully connected network',
      note: 'This is the regression branch Topic 10 expands later.',
      badges: ['Deep Learning', 'Tabular'],
      tone: 'blue',
    },
    {
      id: 'text',
      title: 'Text classification',
      description: 'Predict whether a text belongs to one of two classes.',
      outputType: 'Binary classification',
      model: 'Transformer network',
      note: 'Same supervised setup, but the output is now a class instead of a number.',
      badges: ['Deep Learning', 'NLP / Language'],
      tone: 'violet',
    },
    {
      id: 'music',
      title: 'Music genre classification',
      description: 'Assign a clip to one of several genres.',
      outputType: 'Multiclass classification',
      model: 'Recurrent neural network (RNN)',
      note: 'Audio task, many labels, still supervised learning.',
      badges: ['Deep Learning', 'Audio'],
      tone: 'emerald',
    },
    {
      id: 'image',
      title: 'Image classification',
      description: 'Assign an image to one of several object classes.',
      outputType: 'Multiclass classification',
      model: 'Convolutional network',
      note: 'One label for the whole image. This is classic computer vision.',
      badges: ['Deep Learning', 'Computer Vision'],
      tone: 'amber',
    },
    {
      id: 'segmentation',
      title: 'Image segmentation',
      description: 'Predict many pixel-level labels at once.',
      outputType: 'Multivariate binary classification',
      model: 'Convolutional encoder-decoder',
      note: 'Many outputs at once, so it differs sharply from one-number regression.',
      badges: ['Deep Learning', 'Computer Vision'],
      tone: 'amber',
    },
    {
      id: 'translation',
      title: 'Translation',
      description: 'Produce an output sequence in another language.',
      outputType: 'Structured sequence output',
      model: 'Sequence-to-sequence language model',
      note: 'Not one label and not one number. The output is a whole sequence.',
      badges: ['Deep Learning', 'NLP / Language'],
      tone: 'violet',
    },
  ] as const;

  const [selectedId, setSelectedId] = useState<(typeof tasks)[number]['id']>('house-price');
  const [visited, setVisited] = useState<Set<(typeof tasks)[number]['id']>>(
    () => new Set(['house-price']),
  );
  const [didComplete, setDidComplete] = useState(false);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? tasks[0];

  useEffect(() => {
    if (visited.size >= 4 && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, visited]);

  const handleSelect = (taskId: (typeof tasks)[number]['id']) => {
    setSelectedId(taskId);
    setVisited((prev) => new Set(prev).add(taskId));
  };

  const toneClass = {
    blue: 'from-blue-500/10 via-transparent to-transparent',
    violet: 'from-violet-500/10 via-transparent to-transparent',
    emerald: 'from-emerald-500/10 via-transparent to-transparent',
    amber: 'from-amber-500/10 via-transparent to-transparent',
  } as const;

  return (
    <div className="space-y-4">
      <p>
        The lecture then zooms out across modern ML domains. Same broad idea, different data types, different outputs, different model families.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => handleSelect(task.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  task.id === selectedId ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{task.title}</div>
                  {task.badges.slice(1).map((badge) => (
                    <Tag
                      key={badge}
                      label={badge}
                      tone={badge === 'Computer Vision' ? 'amber' : badge === 'Audio' ? 'emerald' : badge === 'Tabular' ? 'blue' : 'violet'}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{task.description}</div>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              className={cn(
                'rounded-[28px] border bg-gradient-to-br p-5',
                toneClass[selectedTask.tone],
              )}
            >
              <div className="flex flex-wrap gap-2">
                {selectedTask.badges.map((badge) => (
                  <Tag
                    key={badge}
                    label={badge}
                    tone={badge === 'Computer Vision' ? 'amber' : badge === 'Audio' ? 'emerald' : badge === 'Tabular' ? 'blue' : 'violet'}
                  />
                ))}
              </div>
              <h3 className="mt-3 text-2xl font-semibold">{selectedTask.title}</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">{selectedTask.description}</p>

              <div className="mt-5 rounded-[24px] border bg-background/70 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Output snapshot
                </div>
                <div className="mt-4">
                  <OutputPreview taskId={selectedTask.id} />
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Output type
                  </div>
                  <div className="mt-2 text-sm">{selectedTask.outputType}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Example model
                  </div>
                  <div className="mt-2 text-sm">{selectedTask.model}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Why it matters
                  </div>
                  <div className="mt-2 text-sm">{selectedTask.note}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
      <CalloutBox type="info" title="Topic 10 Scope">
        <p>
          This overview is broad on purpose. After seeing how ML stretches across tabular data, language, audio, and vision, the rest of Topic 10 narrows to one supervised case: regression.
        </p>
      </CalloutBox>
    </div>
  );
}

const FIT_POINTS = [
  [45, 178],
  [75, 166],
  [105, 146],
  [135, 120],
  [165, 102],
  [195, 94],
  [225, 96],
  [255, 105],
  [285, 126],
  [315, 152],
] as const;

const FIT_PATHS = {
  underfit: 'M 28 184 L 330 118',
  good: 'M 24 186 C 78 168 112 130 150 108 C 192 88 228 90 266 106 C 296 120 318 136 336 154',
  overfit: 'M 24 198 C 44 80 72 210 98 100 C 120 44 150 176 178 80 C 206 40 236 190 264 92 C 292 56 318 166 338 130',
} as const;

function FitPreview({ kind }: { kind: keyof typeof FIT_PATHS }) {
  return (
    <svg viewBox="0 0 360 220" className="h-36 w-full rounded-lg border bg-muted/20">
      {FIT_POINTS.map(([x, y], index) => (
        <circle key={`${kind}-${index}`} cx={x} cy={y} r={4} fill="var(--primary)" opacity={0.8} />
      ))}
      <path d={FIT_PATHS[kind]} fill="none" stroke="var(--color-error)" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

function FitDiagnosisExercise({ onComplete }: { onComplete: () => void }) {
  const models = [
    {
      id: 'model-a',
      title: 'Model A',
      kind: 'underfit',
      answer: 'Underfit',
      explanation: 'Correct. The straight line misses the main curve, so the model is too simple.',
    },
    {
      id: 'model-b',
      title: 'Model B',
      kind: 'good',
      answer: 'Good fit',
      explanation: 'Correct. This curve follows the broad pattern without reacting to every individual point.',
    },
    {
      id: 'model-c',
      title: 'Model C',
      kind: 'overfit',
      answer: 'Overfit',
      explanation: 'Correct. The curve wiggles to chase individual samples, which hurts generalization.',
    },
  ] as const;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = models.every((model) => answers[model.id]);
  const allCorrect = models.every((model) => answers[model.id] === model.answer);

  useEffect(() => {
    if (submitted && allCorrect) {
      onComplete();
    }
  }, [allCorrect, onComplete, submitted]);

  return (
    <div className="space-y-4">
      <p>
        The regression notebook compares degree-1, degree-3, and degree-10 models for one reason: to see when a model is too simple, just right, or far too flexible.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {models.map((model) => {
          const answer = answers[model.id];
          const correct = submitted && answer === model.answer;
          const wrong = submitted && answer && answer !== model.answer;

          return (
            <div
              key={model.id}
              className={cn(
                'rounded-xl border p-4',
                correct && 'border-green-500 bg-green-500/10',
                wrong && 'border-red-500 bg-red-500/10',
              )}
            >
              <div className="font-semibold">{model.title}</div>
              <div className="mt-3">
                <FitPreview kind={model.kind} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Underfit', 'Good fit', 'Overfit'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [model.id]: label }))}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      answer === label && !submitted && 'border-primary bg-primary/10',
                      !submitted && answer !== label && 'hover:bg-muted',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {submitted && (
                <div
                  className={cn(
                    'mt-3 rounded-lg px-3 py-2 text-sm',
                    correct
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300',
                  )}
                >
                  {model.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={() => setSubmitted(true)} disabled={!allAnswered}>
          Diagnose the fits
        </Button>
      ) : !allCorrect ? (
        <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
          Try again
        </Button>
      ) : (
        <CalloutBox type="tip" title="Generalization check">
          <p>
            Good fit means the model captures the trend and still works on unseen data. That is why the regression notebook keeps comparing train and test performance.
          </p>
        </CalloutBox>
      )}
    </div>
  );
}

export default function Topic10RegressionPage() {
  const renderCard = useCallback((index: number, onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((item) => item.id === card.sectionId);

    switch (card.component) {
      case 'MLDefinitionHook':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <MLDefinitionHook onComplete={onComplete} />
          </LessonCard>
        );

      case 'ParadigmPlayground':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ParadigmPlayground onComplete={onComplete} />
          </LessonCard>
        );

      case 'ReinforcementLoopGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ReinforcementLoopGame onComplete={onComplete} />
          </LessonCard>
        );

      case 'SupervisedModel':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SupervisedModelExplorer onComplete={onComplete} />
          </LessonCard>
        );

      case 'OutputTypeArcade':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <OutputTypeArcade onComplete={onComplete} />
          </LessonCard>
        );

      case 'TrainTestSplit':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <TrainTestSplitExplorer onComplete={onComplete} />
          </LessonCard>
        );

      case 'DeepLearningDomainAtlas':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <DeepLearningDomainAtlas onComplete={onComplete} />
          </LessonCard>
        );

      case 'QuizWhy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_101} onComplete={onComplete} />
          </LessonCard>
        );

      case 'PriceGuessHook':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <PriceGuessHookContent onComplete={onComplete} />
          </LessonCard>
        );

      case 'FitTheLine':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Drag the line until it matches the scatter. This is the core intuition behind simple linear regression: adjust slope and intercept until the prediction line follows the trend.
            </p>
            <Suspense fallback={<VizLoading />}>
              <FitTheLineGame onSolved={onComplete} />
            </Suspense>
          </LessonCard>
        );

      case 'ResidualSquares':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Residuals are the gaps between observed values and predictions. This visualization shows why large misses matter more once we square the error.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ResidualSquaresViz />
            </Suspense>
          </LessonCard>
        );

      case 'RegressionEquation':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>A simple linear model uses one feature, one slope, and one intercept:</p>
            <BlockMath>{'\\hat{y} = wx + b'}</BlockMath>
            <div className="grid gap-4 md:grid-cols-2 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm"><M>w</M> changes the slope</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Bigger <M>w</M> means a steeper line and a larger change in the prediction for each step in <M>x</M>.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm"><M>b</M> shifts the line</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  The bias moves the whole line up or down without changing its tilt.
                </div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="Residual thinking">
              <p>
                The model is not trying to hit every point exactly. It is trying to make the overall residual error as small as possible across the training set.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizLine':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_102} onComplete={onComplete} />
          </LessonCard>
        );

      case 'HousingDataset':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The regression notebook uses the California Housing dataset from the 1990 census. Each row is a small geographic area, and the target is median house value.
            </p>
            <div className="grid gap-4 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Scale</div>
                <div className="mt-1 text-sm text-muted-foreground">About 20,640 block groups, not just a toy dataset.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Strongest feature</div>
                <div className="mt-1 text-sm text-muted-foreground">`MedInc` is the strongest single predictor in the notebook.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Real-world wrinkle</div>
                <div className="mt-1 text-sm text-muted-foreground">The target is capped at $500k, so the dataset is not perfectly clean.</div>
              </div>
            </div>
            <CalloutBox type="info" title="Why this dataset works">
              <p>
                It is big enough to feel real, visual enough to inspect, and structured enough to show how one feature, many features, and geography all affect predictions.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'MultipleRegression':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Once one feature is not enough, linear regression extends naturally: each feature gets its own weight.
            </p>
            <BlockMath>{'\\hat{y} = w_1x_1 + w_2x_2 + \\dots + w_dx_d + b'}</BlockMath>
            <p>
              In the notebook, the one-feature baseline using `MedInc` reaches about <strong>R^2 ~= 0.47</strong>. Using all eight features raises that to about <strong>R^2 ~= 0.61</strong>.
            </p>
            <CalloutBox type="key-idea" title="Coefficient intuition">
              <p>
                Each coefficient answers: “if this feature goes up by one unit, how does the prediction change, assuming the others stay fixed?” The notebook highlights `MedInc` as the strongest positive driver.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizMulti':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_103} onComplete={onComplete} />
          </LessonCard>
        );

      case 'FitDiagnosis':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <FitDiagnosisExercise onComplete={onComplete} />
          </LessonCard>
        );

      case 'GeneralizationGap':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The polynomial example is here for one reason: compare <strong>underfit</strong>, <strong>good fit</strong>, and <strong>overfit</strong> using train versus test performance.
            </p>
            <div className="grid gap-4 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">Underfit</div>
                <div className="mt-1 text-sm text-muted-foreground">Too simple to capture the pattern, so both train and test stay weak.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">Good fit</div>
                <div className="mt-1 text-sm text-muted-foreground">Captures the main trend and keeps the train/test gap small.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">Overfit</div>
                <div className="mt-1 text-sm text-muted-foreground">Looks great on training data but gets worse on unseen data.</div>
              </div>
            </div>
            <CalloutBox type="warning" title="Notebook continuations">
              <p>
                Regularization and gradient descent still exist in the regression notebook, but they stay outside the core lesson flow here.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizFitQuality':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_104} onComplete={onComplete} />
          </LessonCard>
        );

      default:
        return null;
    }
  }, []);

  return (
    <LessonStepper
      cards={CARDS}
      sections={SECTIONS}
      storagePrefix="lesson-t10-regression"
      renderCard={renderCard}
      enforceRequiredCompletion={false}
    />
  );
}
