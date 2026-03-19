import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { useLabProgress } from '@/hooks/useLabProgress';

export interface StepDef {
  id: number;
  title: string;
  content: (onComplete: () => void) => ReactNode;
}

interface StepChallengeProps {
  exerciseId: string;
  steps: StepDef[];
}

export default function StepChallenge({ exerciseId, steps }: StepChallengeProps) {
  const { isStepComplete, markStepComplete } = useLabProgress(exerciseId, steps.length);

  // Find first incomplete step
  const firstIncomplete = steps.findIndex((s) => !isStepComplete(s.id));
  const [activeStep, setActiveStep] = useState(firstIncomplete === -1 ? steps.length - 1 : firstIncomplete);

  const handleComplete = (stepId: number) => {
    markStepComplete(stepId);
    // Auto-advance to next step
    const nextIdx = steps.findIndex((s) => s.id > stepId && !isStepComplete(s.id));
    if (nextIdx !== -1) {
      setTimeout(() => setActiveStep(nextIdx), 400);
    }
  };

  return (
    <div>
      {/* Step indicator bar */}
      <div className="flex items-center gap-1 mb-5">
        {steps.map((step, i) => {
          const done = isStepComplete(step.id);
          const active = i === activeStep;
          return (
            <div key={step.id} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : done
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {done && <Check className="size-3" />}
                <span>Step {step.id}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Step title */}
      <h4 className="text-sm font-semibold text-muted-foreground mb-3">
        Step {steps[activeStep].id}: {steps[activeStep].title}
      </h4>

      {/* Step content with slide transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {isStepComplete(steps[activeStep].id) && (
            <div className="mb-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
              Completed. You can redo this step if you want.
            </div>
          )}
          {steps[activeStep].content(() => handleComplete(steps[activeStep].id))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
