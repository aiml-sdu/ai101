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
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import { M, BlockMath } from '@/components/Math';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CARDS, QUIZ_111, QUIZ_112, QUIZ_113, SECTIONS } from '@/data/topic-11-cards';
import { generateLinearData, olsFit } from '@/lib/regression-math';

const FitTheLineGame = lazy(() => import('./visualizations/FitTheLineGame'));
const ResidualSquaresViz = lazy(() => import('./visualizations/ResidualSquaresViz'));

function VizLoading() {
  return (
    <div className="flex h-64 items-center justify-center rounded-3xl bg-muted text-sm text-muted-foreground animate-pulse">
      Loading visualization...
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

function PriceGuessHookContent({ onComplete }: { onComplete: () => void }) {
  const points = useMemo(() => generateLinearData(15, 3.2, 20, 12, 99), []);
  const [guess, setGuess] = useState<number | null>(null);
  const ols = useMemo(() => olsFit(points), [points]);
  const targetX = 7.5;
  const trueY = ols.w * targetX + ols.b;

  useEffect(() => {
    if (guess !== null) onComplete();
  }, [guess, onComplete]);

  const vbWidth = 600;
  const vbHeight = 340;
  const pad = { top: 20, right: 30, bottom: 50, left: 60 };
  const plotW = vbWidth - pad.left - pad.right;
  const plotH = vbHeight - pad.top - pad.bottom;
  const xMin = 0;
  const xMax = 10;
  const yMin = 0;
  const yMax = 70;
  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    if (guess !== null) return;
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scale = vbWidth / rect.width;
    const clickY = (event.clientY - rect.top) * scale;
    const dataY = yMin + ((pad.top + plotH - clickY) / plotH) * (yMax - yMin);
    setGuess(Math.max(yMin, Math.min(yMax, dataY)));
  };

  return (
    <div className="space-y-4">
      <p>
        This is the core regression move: you see examples, then try to predict a new number. Click on the chart to guess the price for the marked house.
      </p>
      <Surface className="overflow-hidden p-0">
        <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} className="w-full cursor-crosshair" onClick={handleClick}>
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="var(--border)" strokeWidth={1} />
          <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="var(--border)" strokeWidth={1} />
          <text x={pad.left + plotW / 2} y={vbHeight - 8} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12}>Size</text>
          <text
            x={14}
            y={pad.top + plotH / 2}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize={12}
            transform={`rotate(-90, 14, ${pad.top + plotH / 2})`}
          >
            Price
          </text>
          {[2, 4, 6, 8].map((x) => (
            <g key={`gx-${x}`}>
              <line x1={sx(x)} y1={pad.top} x2={sx(x)} y2={pad.top + plotH} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={sx(x)} y={pad.top + plotH + 16} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>{x}</text>
            </g>
          ))}
          {[10, 20, 30, 40, 50, 60].map((y) => (
            <g key={`gy-${y}`}>
              <line x1={pad.left} y1={sy(y)} x2={pad.left + plotW} y2={sy(y)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={pad.left - 8} y={sy(y) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>{y}</text>
            </g>
          ))}
          <line x1={sx(targetX)} y1={pad.top} x2={sx(targetX)} y2={pad.top + plotH} stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.55} />
          <text x={sx(targetX)} y={pad.top - 6} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={600}>new house</text>
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
    if (submitted && allCorrect) onComplete();
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
            Good fit means the model captures the trend and still works on unseen data. That is why the notebook keeps comparing train and test performance.
          </p>
        </CalloutBox>
      )}
    </div>
  );
}

export default function Topic11RegressionPage() {
  const renderCard = useCallback((index: number, onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((item) => item.id === card.sectionId);

    switch (card.component) {
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
            <QuizCard questions={QUIZ_111} onComplete={onComplete} />
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
            <QuizCard questions={QUIZ_112} onComplete={onComplete} />
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
            <QuizCard questions={QUIZ_113} onComplete={onComplete} />
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
      storagePrefix="lesson-t11-regression"
      renderCard={renderCard}
      enforceRequiredCompletion={false}
    />
  );
}
