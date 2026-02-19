import { Card, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

interface TldrBoxProps {
  items: string[];
}

export default function TldrBox({ items }: TldrBoxProps) {
  return (
    <Card className="my-4 bg-muted/40">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          <ListChecks className="size-4" />
          TLDR
        </div>
        <ul className="my-0 space-y-1 text-sm">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
