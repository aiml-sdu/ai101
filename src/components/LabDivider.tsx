import { Badge } from '@/components/ui/badge';
import { FlaskConical } from 'lucide-react';

export default function LabDivider() {
  return (
    <div className="relative flex items-center justify-center my-12">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <Badge variant="outline" className="relative bg-background px-4 py-1.5 text-sm font-semibold gap-1.5">
        <FlaskConical className="size-4" />
        Lab 2: Practice
      </Badge>
    </div>
  );
}
