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
import ExerciseCard from '@/components/ExerciseCard';
import { M, BlockMath } from '@/components/Math';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CARDS,
  QUIZ_101,
  QUIZ_102,
  QUIZ_103,
  QUIZ_104,
  QUIZ_105,
  SECTIONS,
} from '@/data/topic-10-cards';
import { generateLinearData, olsFit } from '@/lib/regression-math';

const FitTheLineGame = lazy(() => import('./visualizations/FitTheLineGame'));
const ResidualSquaresViz = lazy(() => import('./visualizations/ResidualSquaresViz'));
const Exercise1HousingExplore = lazy(() => import('./visualizations/lab/Exercise1HousingExplore'));
const Exercise2SimpleVsMultipleRegression = lazy(
  () => import('./visualizations/lab/Exercise2SimpleVsMultipleRegression'),
);
const Exercise3FitDiagnosis = lazy(() => import('./visualizations/lab/Exercise3FitDiagnosis'));

function VizLoading() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground animate-pulse">
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
              'rounded-xl border p-4 text-left transition-colors',
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
      <div className="rounded-lg border border-border bg-card overflow-hidden">
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
      </div>
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

function ParadigmPlayground({ onComplete }: { onComplete: () => void }) {
  const scenarios = [
    {
      id: 'cluster',
      title: 'Group unlabeled examples',
      prompt: 'You only have raw measurements and want to cluster similar examples together.',
      answer: 'unsupervised',
      explanation: 'Unsupervised learning is about structure in unlabeled data: clustering, outliers, generation, and filling in missing data.',
    },
    {
      id: 'chess',
      title: 'Learn by rewards',
      prompt: 'An agent explores chess positions, takes actions, and receives rewards for good outcomes.',
      answer: 'reinforcement',
      explanation: 'Reinforcement learning uses states, actions, and rewards. The chess example on the slide is the template.',
    },
    {
      id: 'price',
      title: 'Predict from paired examples',
      prompt: 'Each house has features and a known selling price, and the model must learn the mapping.',
      answer: 'supervised',
      explanation: 'Supervised learning uses paired input/output examples. Topic 10 takes this branch and goes deeper on regression.',
    },
  ] as const;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [didComplete, setDidComplete] = useState(false);

  useEffect(() => {
    const allCorrect = scenarios.every((scenario) => answers[scenario.id] === scenario.answer);
    if (allCorrect && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [answers, didComplete, onComplete, scenarios]);

  return (
    <div className="space-y-4">
      <p>
        The lecture opens with a broad idea: <strong>machine learning</strong> means getting a computer to do well on a task without explicitly programming every rule, and improving from experience.
      </p>
      <div className="rounded-xl border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Paradigm playground
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Match each lecture scenario to the right learning paradigm. You can keep skimming even if you do not finish it.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const selected = answers[scenario.id];
          const isCorrect = selected === scenario.answer;
          const isWrong = !!selected && !isCorrect;

          return (
            <motion.div
              key={scenario.id}
              layout
              className={cn(
                'rounded-2xl border bg-card p-4 shadow-sm',
                isCorrect && 'border-green-500/60',
                isWrong && 'border-red-500/50',
              )}
            >
              <div className="text-sm font-semibold">{scenario.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{scenario.prompt}</p>
              <div className="mt-4 grid gap-2">
                {([
                  ['unsupervised', 'Unsupervised'],
                  ['reinforcement', 'Reinforcement'],
                  ['supervised', 'Supervised'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [scenario.id]: value }))}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                      selected === value ? 'border-primary bg-primary/10' : 'hover:bg-muted/60',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.div
                    key={`${scenario.id}-${selected}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cn(
                      'mt-4 rounded-xl px-3 py-2 text-sm',
                      isCorrect
                        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 text-red-700 dark:text-red-300',
                    )}
                  >
                    {scenario.explanation}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      {didComplete && (
        <CalloutBox type="key-idea" title="Why Topic 10 Zooms In">
          <p>
            After this overview, the rest of Topic 10 follows the supervised branch and focuses on regression, where the output is a continuous value.
          </p>
        </CalloutBox>
      )}
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
      equation: 'ŷ = 3x + 95',
      slope: 3,
      intercept: 95,
      verdict: 'This family member misses the upward trend. It stays too flat as age increases.',
    },
    {
      id: 'fit',
      label: 'Best fit in this family',
      equation: 'ŷ = 6x + 78',
      slope: 6,
      intercept: 78,
      verdict: 'This candidate tracks the training points well. Learning means choosing this kind of equation from the family.',
    },
    {
      id: 'steep',
      label: 'Too steep',
      equation: 'ŷ = 9x + 60',
      slope: 9,
      intercept: 60,
      verdict: 'This equation rises too quickly. It still belongs to the family, but it does not fit the training data well.',
    },
  ] as const;
  const [selectedId, setSelectedId] = useState<(typeof candidates)[number]['id'] | null>(null);
  const [didComplete, setDidComplete] = useState(false);

  useEffect(() => {
    if (selectedId && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [selectedId, didComplete, onComplete]);

  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[1];
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
        The slide’s supervised-learning intuition is simple: imagine a family of equations relating an input like <strong>age</strong> to an output like <strong>height</strong>.
      </p>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border bg-card p-4">
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
            {[5, 7, 9, 11, 13].map((age) => (
              <g key={age}>
                <line x1={sx(age)} y1={PAD.top} x2={sx(age)} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
                <text x={sx(age)} y={PAD.top + plotH + 16} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>{age}</text>
              </g>
            ))}
            {[100, 120, 140, 160].map((height) => (
              <g key={height}>
                <line x1={PAD.left} y1={sy(height)} x2={PAD.left + plotW} y2={sy(height)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
                <text x={PAD.left - 8} y={sy(height) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>{height}</text>
              </g>
            ))}
            <line
              x1={sx(xMin)}
              y1={sy(selected.slope * xMin + selected.intercept)}
              x2={sx(xMax)}
              y2={sy(selected.slope * xMax + selected.intercept)}
              stroke="var(--primary)"
              strokeWidth={3}
              strokeLinecap="round"
            />
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
                    opacity={0.75}
                  />
                  <circle cx={sx(sample.age)} cy={sy(sample.height)} r={6} fill="white" stroke="var(--primary)" strokeWidth={2.5} />
                  <circle cx={sx(sample.age)} cy={sy(predicted)} r={4.5} fill="var(--primary)" />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => setSelectedId(candidate.id)}
              className={cn(
                'w-full rounded-2xl border bg-card p-4 text-left transition-colors',
                selected.id === candidate.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
              )}
            >
              <div className="text-sm font-semibold">{candidate.label}</div>
              <div className="mt-1 font-mono text-sm text-muted-foreground">{candidate.equation}</div>
            </button>
          ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border bg-card p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current candidate
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
      <CalloutBox type="info" title="What the Slide Is Saying">
        <p>
          A supervised model is not one fixed equation. It is a search space of candidate equations, and learning means choosing the one that fits the paired training data best.
        </p>
      </CalloutBox>
    </div>
  );
}

function TaskOutputPreview({ taskId }: { taskId: string }) {
  if (taskId === 'house-price') {
    return (
      <div className="space-y-3">
        <div className="text-3xl font-semibold text-primary">$425k</div>
        <div className="h-2 rounded-full bg-primary/15">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  if (taskId === 'text') {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-muted px-3 py-1 text-xs">NEGATIVE</span>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">POSITIVE</span>
      </div>
    );
  }

  if (taskId === 'translation') {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-lg bg-muted px-3 py-2">Hello</span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground">Hej</span>
      </div>
    );
  }

  if (taskId === 'segmentation') {
    return (
      <div className="grid w-fit grid-cols-5 gap-1">
        {Array.from({ length: 20 }, (_, index) => (
          <div
            key={index}
            className={cn(
              'size-4 rounded-sm',
              index % 5 === 2 || index > 11 ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {['Class A', 'Class B', 'Class C', 'Class D'].map((label, index) => (
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

function TaskGalleryExplorer({ onComplete }: { onComplete: () => void }) {
  const tasks = [
    {
      id: 'house-price',
      title: 'House price',
      description: 'Predict the selling price of a home from its features.',
      outputType: 'Regression · continuous value',
      model: 'Fully connected network',
      note: 'This is the branch Topic 10 expands: one numeric prediction.',
    },
    {
      id: 'text',
      title: 'Text classification',
      description: 'Predict whether a text belongs to one of two classes.',
      outputType: 'Binary classification',
      model: 'Transformer network',
      note: 'Two discrete classes instead of a number.',
    },
    {
      id: 'music',
      title: 'Music genre classification',
      description: 'Assign a clip to one of several genres.',
      outputType: 'Multiclass classification',
      model: 'Recurrent neural network (RNN)',
      note: 'More than two discrete labels.',
    },
    {
      id: 'image',
      title: 'Image classification',
      description: 'Assign an image to one of several object classes.',
      outputType: 'Multiclass classification',
      model: 'Convolutional network',
      note: 'One label for the whole image.',
    },
    {
      id: 'segmentation',
      title: 'Image segmentation',
      description: 'Predict many pixel-level labels at once.',
      outputType: 'Multivariate binary classification',
      model: 'Convolutional encoder-decoder',
      note: 'Many outputs at once instead of one class.',
    },
    {
      id: 'translation',
      title: 'Translation',
      description: 'Produce an output sequence in another language.',
      outputType: 'Structured sequence output',
      model: 'Sequence-to-sequence style model',
      note: 'Not a single label or number; the output is a whole sequence.',
    },
  ] as const;

  const [selectedId, setSelectedId] = useState<(typeof tasks)[number]['id']>('house-price');
  const [visited, setVisited] = useState<Set<(typeof tasks)[number]['id']>>(
    () => new Set(['house-price']),
  );
  const [didComplete, setDidComplete] = useState(false);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? tasks[0];

  useEffect(() => {
    if (visited.size >= 3 && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [visited, didComplete, onComplete]);

  const handleSelect = (taskId: (typeof tasks)[number]['id']) => {
    setSelectedId(taskId);
    setVisited((prev) => new Set(prev).add(taskId));
  };

  return (
    <div className="space-y-4">
      <p>
        The slide deck tours several ML domains before zooming in. Click around between the examples and compare their output types and model families.
      </p>
      <div className="text-sm text-muted-foreground">
        Explore at least <strong>3 examples</strong> to mark this card complete. You can still skim forward at any time.
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((task) => {
            const active = task.id === selectedId;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => handleSelect(task.id)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors',
                  active ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                )}
              >
                <div className="font-semibold">{task.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">{task.outputType}</div>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedTask.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            className="rounded-xl border bg-card p-5"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Slide framing
            </div>
            <h3 className="mt-2 text-lg font-semibold">{selectedTask.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{selectedTask.description}</p>
            <div className="mt-4 rounded-xl border bg-background/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Output snapshot
              </div>
              <div className="mt-3">
                <TaskOutputPreview taskId={selectedTask.id} />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-sm font-semibold">Output type</div>
                <div className="text-sm text-muted-foreground">{selectedTask.outputType}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">Example model</div>
                <div className="text-sm text-muted-foreground">{selectedTask.model}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">Why it matters here</div>
                <div className="text-sm text-muted-foreground">{selectedTask.note}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <CalloutBox type="info" title="Topic 10 Scope">
        <p>
          The deck introduces several ML domains first. This topic still uses the rest of the time to go deep on the regression case.
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
        The lab notebook’s degree-1, degree-3, and degree-10 examples all tell the same story: too simple misses structure, too flexible memorizes noise.
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
            Good fit means the model captures the trend and still works on unseen data. That is why the notebook keeps comparing train and test performance.
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
      case 'ParadigmPlayground':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ParadigmPlayground onComplete={onComplete} />
          </LessonCard>
        );

      case 'PriceGuessHook':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <PriceGuessHookContent onComplete={onComplete} />
          </LessonCard>
        );

      case 'SupervisedModel':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SupervisedModelExplorer onComplete={onComplete} />
          </LessonCard>
        );

      case 'QuizWhy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_101} onComplete={onComplete} />
          </LessonCard>
        );

      case 'TaskGallery':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <TaskGalleryExplorer onComplete={onComplete} />
          </LessonCard>
        );

      case 'RegressionTerms':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The regression slice of the slide deck only needs four terms: <strong>continuous output</strong>, <strong>classification as contrast</strong>, <strong>univariate output</strong>, and <strong>multivariate output</strong>.
            </p>
            <div className="grid gap-4 md:grid-cols-2 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">Univariate output</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  One predicted number, like a single house price.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">Multivariate output</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  More than one predicted value at once, like predicting both demand and wait time.
                </div>
              </div>
            </div>
            <CalloutBox type="info" title="Inputs vs Outputs">
              <p>
                Many input features do <em>not</em> automatically mean multivariate output. You can have many inputs and still predict just one number.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'TrainTestSplit':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ChoiceExercise
              prompt="We fit on one split and judge on another. Which split tells us whether the model works on unseen data?"
              supporting={(
                <div className="grid gap-3 md:grid-cols-3 not-prose">
                  <div className="rounded-xl border p-4">
                    <div className="text-sm font-semibold">Raw data</div>
                    <div className="mt-1 text-sm text-muted-foreground">Examples with inputs and known targets</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-sm font-semibold">Train split</div>
                    <div className="mt-1 text-sm text-muted-foreground">Used to fit the line or model parameters</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-sm font-semibold">Test split</div>
                    <div className="mt-1 text-sm text-muted-foreground">Held back until the final check</div>
                  </div>
                </div>
              )}
              options={[
                {
                  id: 'test',
                  label: 'Use the test split',
                  detail: 'It estimates performance on new data',
                  correct: true,
                  explanation: 'Correct. Test data is the honest evaluation because the model did not fit on it.',
                },
                {
                  id: 'train',
                  label: 'Use the training split',
                  detail: 'It is the data the model already saw while learning',
                  correct: false,
                  explanation: 'Training data can look deceptively good because the model already optimized itself around it.',
                },
                {
                  id: 'both',
                  label: 'Combine train and test first',
                  detail: 'This leaks the answer into the evaluation',
                  correct: false,
                  explanation: 'Mixing them destroys the whole point of a held-out check.',
                },
              ]}
              onComplete={onComplete}
            />
          </LessonCard>
        );

      case 'QuizBasics':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_102} onComplete={onComplete} />
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
            <CalloutBox type="key-idea" title="Residual Thinking">
              <p>
                The model is not trying to hit every point exactly. It is trying to make the overall residual error as small as possible across the training set.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizLine':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_103} onComplete={onComplete} />
          </LessonCard>
        );

      case 'HousingDataset':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              `lab1-regression` uses the California Housing dataset from the 1990 census. Each row is a small geographic area, and the target is median house value.
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
            <CalloutBox type="info" title="Why This Dataset Works">
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
              In the notebook, the one-feature baseline using `MedInc` reaches about <strong>R² ≈ 0.47</strong>. Using all eight features raises that to about <strong>R² ≈ 0.61</strong>.
            </p>
            <CalloutBox type="key-idea" title="Coefficient Intuition">
              <p>
                Each coefficient answers: “if this feature goes up by one unit, how does the prediction change, assuming the others stay fixed?” The lab highlights `MedInc` as the strongest positive driver.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizMulti':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_104} onComplete={onComplete} />
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
              The notebook’s polynomial example is here for one reason: to compare <strong>underfit</strong>, <strong>good fit</strong>, and <strong>overfit</strong> using train versus test performance.
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
            <CalloutBox type="warning" title="Notebook-Only Extensions">
              <p>
                Regularization and gradient descent still exist in `lab1-regression`, but they are intentionally left as notebook continuations instead of core lesson sections here.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizFitQuality':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_105} onComplete={onComplete} />
          </LessonCard>
        );

      case 'Lab10Ex1':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ExerciseCard exerciseId="lab10-ex1" number={1} title="Explore the Housing Data" totalSteps={3} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1HousingExplore onComplete={onComplete} />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      case 'Lab10Ex2':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ExerciseCard exerciseId="lab10-ex2" number={2} title="Simple vs Multiple Regression" totalSteps={3} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise2SimpleVsMultipleRegression onComplete={onComplete} />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      case 'Lab10Ex3':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ExerciseCard exerciseId="lab10-ex3" number={3} title="Diagnose the Fit" totalSteps={3} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise3FitDiagnosis onComplete={onComplete} />
              </Suspense>
            </ExerciseCard>
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
