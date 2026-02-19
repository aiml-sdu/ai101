import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface StubPageProps {
  number: number;
  title: string;
  description: string;
}

export default function StubPage({ number, title, description }: StubPageProps) {
  return (
    <div className="prose">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-muted-foreground font-mono text-sm">Topic {number}</span>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
      <Link to="/welcome">&larr; Back to Welcome</Link>
    </div>
  );
}
