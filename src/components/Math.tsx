import { useMemo } from 'react';
import katex from 'katex';

interface MathProps {
  children: string;
}

export function M({ children }: MathProps) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false }),
    [children],
  );
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlockMath({ children }: MathProps) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, displayMode: true }),
    [children],
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
