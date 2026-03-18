import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  createAustraliaMapCSP,
  getAssignmentViolations,
  solveBacktracking,
  type Assignment,
  type AustraliaColor,
  type AustraliaVariable,
} from '@/lib/csp';
import {
  AustraliaAssignmentList,
  AustraliaColorPalette,
  AustraliaConstraintGraph,
  AustraliaMapBoard,
} from './CSPShared';

type AustraliaAssignment = Partial<Record<AustraliaVariable, AustraliaColor>>;

export default function AustraliaMapCSPViz() {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const [assignment, setAssignment] = useState<AustraliaAssignment>({});
  const [selectedColor, setSelectedColor] = useState<AustraliaColor | null>('red');
  const [activeRegion, setActiveRegion] = useState<AustraliaVariable | null>('SA');

  const violations = useMemo(
    () => getAssignmentViolations(problem, assignment),
    [problem, assignment],
  );

  const allAssigned = problem.variables.every((variable) => assignment[variable as AustraliaVariable]);
  const solved = allAssigned && violations.length === 0;

  const handleRegionClick = (region: AustraliaVariable) => {
    setActiveRegion(region);
    setAssignment((prev) => {
      const next = { ...prev };
      if (selectedColor === null) {
        delete next[region];
      } else {
        next[region] = selectedColor;
      }
      return next;
    });
  };

  const handleSolve = () => {
    const solution = solveBacktracking(problem, { useMRV: false, useLCV: false }) as Assignment<AustraliaColor> | null;
    if (solution) {
      setAssignment(solution);
      setActiveRegion('SA');
    }
  };

  const clearBoard = () => {
    setAssignment({});
    setActiveRegion('SA');
    setSelectedColor('red');
  };

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Color the map with only 3 colors</h3>
          <p className="text-sm text-muted-foreground">
            Adjacent regions must have different colors. Tasmania is isolated.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={clearBoard}>
            Reset
          </Button>
          <Button size="sm" onClick={handleSolve}>
            Show one solution
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <AustraliaColorPalette selectedColor={selectedColor} onSelect={setSelectedColor} />
        <div className="grid gap-4 lg:grid-cols-2">
          <AustraliaMapBoard
            assignment={assignment}
            onRegionClick={handleRegionClick}
            activeRegion={activeRegion}
            violations={violations}
          />
          <AustraliaConstraintGraph
            assignment={assignment}
            problem={problem}
            activeRegion={activeRegion}
            onNodeClick={setActiveRegion}
            violations={violations}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <AustraliaAssignmentList assignment={assignment} />
        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="font-semibold">Status</div>
          <div className="mt-2 space-y-1 text-muted-foreground">
            <p>Assigned regions: {Object.keys(assignment).length} / 7</p>
            <p>Constraint violations: {violations.length}</p>
            <p>
              Active color:{' '}
              <span className="font-medium text-foreground">
                {selectedColor ? selectedColor : 'erase'}
              </span>
            </p>
          </div>
          <div className="mt-3 rounded-lg border bg-card px-3 py-2 font-medium">
            {solved
              ? 'Solved: every neighboring pair has different colors.'
              : violations.length > 0
                ? 'Some neighboring regions share a color. Red outlines mark conflicts.'
                : 'No conflicts so far. Keep going.'}
          </div>
        </div>
      </div>
    </div>
  );
}
