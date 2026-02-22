import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LessonProgressBar from './LessonProgressBar';
import CelebrationOverlay from './CelebrationOverlay';
import { setActiveLessonSection } from '@/hooks/useActiveLessonSection';
import type { LessonCardDef, CardSection } from '@/data/topic-04-cards';

function loadCurrent(storagePrefix: string, cardCount: number): number {
  const saved = localStorage.getItem(`${storagePrefix}-current`);
  if (saved !== null) {
    const n = Number(saved);
    if (n >= 0 && n < cardCount) return n;
  }
  return 0;
}

function loadCompleted(storagePrefix: string): Set<string> {
  try {
    const saved = localStorage.getItem(`${storagePrefix}-completed`);
    if (saved) return new Set(JSON.parse(saved));
  } catch { /* ignore */ }
  return new Set();
}

function saveCompleted(storagePrefix: string, set: Set<string>) {
  localStorage.setItem(`${storagePrefix}-completed`, JSON.stringify([...set]));
}

interface LessonStepperProps {
  cards: LessonCardDef[];
  sections: CardSection[];
  storagePrefix: string;
  renderCard: (index: number, onComplete: () => void) => ReactNode;
}

export default function LessonStepper({ cards, sections, storagePrefix, renderCard }: LessonStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(() => loadCurrent(storagePrefix, cards.length));
  const [completedSet, setCompletedSet] = useState(() => loadCompleted(storagePrefix));

  // Persist current index
  useEffect(() => {
    localStorage.setItem(`${storagePrefix}-current`, String(currentIndex));
  }, [currentIndex, storagePrefix]);

  const markComplete = useCallback(() => {
    setCompletedSet((prev) => {
      const next = new Set(prev);
      next.add(cards[currentIndex].id);
      saveCompleted(storagePrefix, next);
      return next;
    });
  }, [currentIndex, cards, storagePrefix]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  }, [cards.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const jumpTo = useCallback((idx: number) => {
    if (idx >= 0 && idx < cards.length) setCurrentIndex(idx);
  }, [cards.length]);

  // Stepper → Sidebar: report current section
  useEffect(() => {
    const sectionId = cards[currentIndex]?.sectionId;
    if (sectionId) setActiveLessonSection(sectionId);
  }, [currentIndex, cards]);

  // Sidebar → Stepper: react to hash changes
  const location = useLocation();
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const section = sections.find((s) => s.id === hash);
    if (section) jumpTo(section.cardRange[0]);
  }, [location.hash, sections, jumpTo]);

  const card = cards[currentIndex];
  const section = useMemo(
    () => sections.find((s) => s.id === card.sectionId),
    [card.sectionId, sections],
  );

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === cards.length - 1;
  const allDone = completedSet.size === cards.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Celebration for completing all cards */}
      <CelebrationOverlay trigger={allDone} intensity="big" />

      {/* Progress bar */}
      <LessonProgressBar
        cards={cards}
        sections={sections}
        currentIndex={currentIndex}
        completedSet={completedSet}
        onJump={jumpTo}
      />

      {/* Card counter */}
      <div className="flex items-center justify-between px-1 py-1.5 text-xs text-muted-foreground">
        <span>{section?.label}</span>
        <span>
          {currentIndex + 1} / {cards.length}
          {allDone && <span className="ml-2 text-green-600 dark:text-green-400 font-bold">Complete!</span>}
        </span>
      </div>

      {/* Card content area */}
      <div className="flex-1 py-4">
        <AnimatePresence mode="wait">
          <div key={card.id}>
            {renderCard(currentIndex, markComplete)}
          </div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3 py-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={isFirst}
          className="gap-1.5"
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>

        <Button
          size="sm"
          onClick={() => {
            markComplete();
            if (!isLast) goNext();
          }}
          className="gap-1.5"
        >
          {isLast ? 'Finish' : 'Continue'}
          {!isLast && <ChevronRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
