import { useNavigate } from 'react-router-dom';
import { NAV_TOPICS } from '@/data/nav-topics';
import { getExerciseProgress } from '@/hooks/useLabProgress';

interface ContentOutlineProps {
  topicId: string;
  activeSection: string;
  visitedSections: Set<string>;
}

// Lab exercise metadata for topic-03
const EXERCISES = [
  { id: 'lab-t03-ex1', steps: 4 },
  { id: 'lab-t03-ex2', steps: 3 },
  { id: 'lab-t03-ex3', steps: 3 },
];

export default function ContentOutline({
  topicId,
  activeSection,
  visitedSections,
}: ContentOutlineProps) {
  const navigate = useNavigate();
  const topic = NAV_TOPICS.find((t) => t.id === topicId);

  if (!topic || topic.sections.length === 0) return null;

  const handleClick = (sectionId: string) => {
    navigate(`/${topicId}#${sectionId}`);
  };

  // Check if this topic has a lab section
  const hasLab = topic.sections.some((s) => s.id === 'section-lab');

  return (
    <nav className="sticky top-6">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">
        On this page
      </div>
      <ul className="space-y-0.5">
        {topic.sections.map((section) => {
          const isActive = activeSection === section.id;
          const isVisited = visitedSections.has(section.id);
          const isLab = section.id === 'section-lab';

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleClick(section.id)}
                className={`group flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  isActive
                    ? 'text-foreground font-semibold border-l-2 border-primary -ml-px pl-[7px]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isVisited && !isActive && (
                  <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                )}
                <span className="text-muted-foreground/60 font-mono text-[10px]">
                  {section.number}
                </span>
                <span className="truncate">{section.title}</span>
              </button>

              {/* Lab exercise progress dots */}
              {isLab && hasLab && (
                <div className="flex items-center gap-2 px-2 py-1 ml-4">
                  {EXERCISES.map((ex) => {
                    const { completed, total } = getExerciseProgress(ex.id, ex.steps);
                    return (
                      <div key={ex.id} className="flex items-center gap-0.5">
                        {Array.from({ length: total }, (_, i) => (
                          <div
                            key={i}
                            className={`size-1.5 rounded-full ${
                              i < completed ? 'bg-primary' : 'bg-muted-foreground/25'
                            }`}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
