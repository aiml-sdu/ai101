interface HookQuestionProps {
  question: string;
  subtext?: string;
}

export default function HookQuestion({ question, subtext }: HookQuestionProps) {
  return (
    <div className="not-prose my-8 rounded-xl border border-border bg-muted/40 px-6 py-8 text-center">
      <p className="text-xl font-medium italic text-foreground/90 md:text-2xl">
        {question}
      </p>
      {subtext && (
        <p className="mt-3 text-sm text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}
