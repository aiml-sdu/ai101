import { Link2 } from 'lucide-react';

interface SectionHeaderProps {
  number: string;
  title: string;
}

function buildSlug(num: string, title: string): string {
  return `${num}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'section';
}

export default function SectionHeader({ number, title }: SectionHeaderProps) {
  const slug = buildSlug(number, title);
  return (
    <div id={slug}>
      <h2 className="group flex items-center gap-2 text-2xl font-semibold tracking-tight mt-10 mb-4 first:mt-0">
        <span className="text-primary font-mono text-lg">{number}</span>
        {' '}{title}
        <a
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          href={`#${slug}`}
          aria-label="Link to this section"
        >
          <Link2 className="size-4" />
        </a>
      </h2>
    </div>
  );
}
