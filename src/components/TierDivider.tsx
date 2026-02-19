import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageCircle, GraduationCap, HelpCircle, PenLine, FlaskConical, Dumbbell } from 'lucide-react';

const TIERS = {
  'first-principles': { label: 'First Principles', icon: Lightbulb },
  feynman: { label: 'Intuitive Explanation', icon: MessageCircle },
  advanced: { label: 'Advanced / Technical', icon: GraduationCap },
  quiz: { label: 'Check Your Understanding', icon: HelpCircle },
  cloze: { label: 'Fill in the Blanks', icon: PenLine },
  lab: { label: 'Lab Exercises', icon: FlaskConical },
  extra: { label: 'Extra Exercises', icon: Dumbbell },
} as const;

interface TierDividerProps {
  tier: keyof typeof TIERS;
  label?: string;
}

export default function TierDivider({ tier, label }: TierDividerProps) {
  const { label: defaultLabel, icon: Icon } = TIERS[tier];
  return (
    <div className="relative flex items-center justify-center my-12">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <Badge variant="outline" className="relative bg-background px-4 py-1.5 text-sm font-semibold gap-1.5">
        <Icon className="size-4" />
        {label ?? defaultLabel}
      </Badge>
    </div>
  );
}
