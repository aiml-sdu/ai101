import { Link2 } from 'lucide-react';

interface SectionHeaderProps {
  number: string;
  title: string;
}

export default function SectionHeader({ number, title }: SectionHeaderProps) {
  const handleAnchorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const section = (e.currentTarget as HTMLElement).closest('section[id]');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <h2 className="group flex items-center gap-2 text-2xl font-semibold tracking-tight mt-10 mb-4 first:mt-0">
      <span className="text-primary font-mono text-lg">{number}</span>
      {' '}{title}
      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        onClick={handleAnchorClick}
        aria-label="Link to this section"
      >
        <Link2 className="size-4" />
      </button>
    </h2>
  );
}
