import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.tsx';
import QuizCard, { type QuizQuestion } from '../components/QuizCard.tsx';
import CalloutBox from '../components/CalloutBox.tsx';
import TldrBox from '../components/TldrBox.tsx';
import PropertiesTable, { type AlgoProperty } from '../components/PropertiesTable.tsx';
import CodeBlock from '../components/CodeBlock.tsx';
import AStarMapViz from './visualizations/AStarMapViz.tsx';
import EightPuzzleViz from './visualizations/EightPuzzleViz.tsx';
import PathfindingGridViz from './visualizations/PathfindingGridViz.tsx';

// TODO: Embed HeuristicHustleGame here next week
// const HeuristicHustleGame = lazy(() => import('./visualizations/HeuristicHustleGame.tsx'));

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

const QUIZ_41: QuizQuestion[] = [
  {
    id: 't04-q01',
    question: 'A heuristic function h(n) estimates:',
    options: [
      'The cost of the path from the start to n',
      'The cost of the cheapest path from n to the goal',
      'The total number of nodes in the search tree',
      'The depth of node n in the search tree',
    ],
    correctIndex: 1,
    explanation: 'A heuristic h(n) provides an estimate of the cost of the cheapest path from node n to the goal. It gives the search algorithm a sense of "direction" without computing the exact cost.',
  },
  {
    id: 't04-q02',
    question: 'For the Romania map problem, the heuristic hSLD (straight-line distance to Bucharest) is useful because:',
    options: [
      'It gives the exact road distance',
      'It is always zero',
      'The straight line is never longer than the actual road',
      'It counts the number of cities on the path',
    ],
    correctIndex: 2,
    explanation: 'The straight-line distance to Bucharest is always less than or equal to the actual road distance (a straight line is the shortest distance between two points). This makes it a useful lower bound.',
  },
];

const QUIZ_42: QuizQuestion[] = [
  {
    id: 't04-q03',
    question: 'Greedy Best-First Search expands the node with:',
    options: [
      'The lowest g(n) (path cost so far)',
      'The lowest h(n) (estimated cost to goal)',
      'The lowest f(n) = g(n) + h(n)',
      'The highest h(n) (estimated cost to goal)',
    ],
    correctIndex: 1,
    explanation: 'Greedy Best-First Search is "greedy" because it always expands whichever node appears closest to the goal according to h(n), completely ignoring the cost already incurred (g(n)).',
  },
  {
    id: 't04-q04',
    question: 'Why is Greedy Best-First Search not guaranteed to find the optimal path?',
    options: [
      'It explores too many nodes',
      'It only considers the estimated cost to the goal, ignoring the cost so far',
      'It uses a FIFO queue instead of a priority queue',
      'It never reaches the goal',
    ],
    correctIndex: 1,
    explanation: 'Greedy ignores g(n) entirely. A node might look close to the goal (low h) but require an expensive detour to reach. This can lead greedy search down a suboptimal path.',
  },
];

const QUIZ_43: QuizQuestion[] = [
  {
    id: 't04-q05',
    question: 'In A* search, f(n) = g(n) + h(n). What does g(n) represent?',
    options: [
      'The estimated cost from n to the goal',
      'The actual cost of the path from start to n',
      'The heuristic value at node n',
      'The number of nodes expanded so far',
    ],
    correctIndex: 1,
    explanation: 'g(n) is the actual cost of the path found so far from the start node to n. Combined with h(n) (the estimated remaining cost), f(n) estimates the total cost of the cheapest solution through n.',
  },
  {
    id: 't04-q06',
    question: 'A* search on the Romania map from Arad to Bucharest finds the optimal path with cost:',
    options: ['366', '418', '450', '504'],
    correctIndex: 1,
    explanation: 'The optimal path is Arad \u2192 Sibiu \u2192 Rimnicu Vilcea \u2192 Pitesti \u2192 Bucharest with cost 140 + 80 + 97 + 101 = 418.',
  },
];

const QUIZ_44: QuizQuestion[] = [
  {
    id: 't04-q07',
    question: 'A heuristic is admissible if it:',
    options: [
      'Always overestimates the true cost to the goal',
      'Never overestimates the true cost to the goal',
      'Equals the true cost to the goal for every node',
      'Returns zero for every node',
    ],
    correctIndex: 1,
    explanation: 'An admissible heuristic never overestimates \u2014 it is always optimistic. This ensures that A* never skips over a cheaper path, guaranteeing optimality.',
  },
  {
    id: 't04-q08',
    question: 'Consistency (monotonicity) requires that for every node n and successor n\u2032 with step cost c(n,n\u2032):',
    options: [
      'h(n) \u2265 h(n\u2032)',
      'h(n) \u2264 c(n,n\u2032) + h(n\u2032)',
      'h(n) = c(n,n\u2032) + h(n\u2032)',
      'g(n) \u2264 h(n)',
    ],
    correctIndex: 1,
    explanation: 'The consistency (or triangle inequality) condition says the estimated cost from n can\'t exceed the step cost to n\u2032 plus the estimate from n\u2032. This is a stronger condition than admissibility and ensures f(n) values never decrease along a path.',
  },
];

const QUIZ_45: QuizQuestion[] = [
  {
    id: 't04-q09',
    question: 'For the 8-puzzle, h2 (Manhattan distance) dominates h1 (misplaced tiles). This means:',
    options: [
      'h2(n) \u2264 h1(n) for all states n',
      'h2(n) \u2265 h1(n) for all states n',
      'h2 is inadmissible',
      'h1 expands fewer nodes than h2',
    ],
    correctIndex: 1,
    explanation: 'Dominance means h2(n) \u2265 h1(n) for all n, while both remain admissible. A dominating heuristic is always at least as informative, so A* with h2 never expands more nodes than A* with h1.',
  },
  {
    id: 't04-q10',
    question: 'Which of the following is NOT a valid heuristic for the 8-puzzle?',
    options: [
      'Number of misplaced tiles',
      'Sum of Manhattan distances',
      'Number of tiles (always 8)',
      'Maximum of h1 and h2',
    ],
    correctIndex: 2,
    explanation: 'A constant function h(n) = 8 overestimates the cost for states near the goal (which may need only 1 move), so it is inadmissible. The maximum of two admissible heuristics is also admissible and more informed.',
  },
];

const QUIZ_47: QuizQuestion[] = [
  {
    id: 't04-q11',
    question: 'Weighted A* with f(n) = g(n) + W \u00b7 h(n), where W > 1, trades:',
    options: [
      'Completeness for speed',
      'Optimality for speed',
      'Speed for optimality',
      'Space for time',
    ],
    correctIndex: 1,
    explanation: 'With W > 1, the heuristic is amplified, making the search more "greedy" and faster. The resulting path cost is at most W times the optimal cost \u2014 you get a bounded suboptimal solution in less time.',
  },
  {
    id: 't04-q12',
    question: 'When W = 1 in weighted A*, the algorithm is equivalent to:',
    options: ['BFS', 'Greedy Best-First Search', 'Standard A*', 'Uniform-Cost Search'],
    correctIndex: 2,
    explanation: 'When W = 1, f(n) = g(n) + 1 \u00b7 h(n) = g(n) + h(n), which is exactly standard A*. As W increases toward \u221e, it approaches Greedy Best-First Search.',
  },
];

// ---------------------------------------------------------------------------
// Properties table for Section 4.7
// ---------------------------------------------------------------------------

const ALGO_PROPERTIES: AlgoProperty[] = [
  {
    name: 'Greedy Best-First',
    complete: 'No*',
    optimal: 'No',
    time: 'O(b^m)',
    space: 'O(b^m)',
  },
  {
    name: 'A*',
    complete: 'Yes',
    optimal: 'Yes (if h admissible)',
    time: 'O(b^m)',
    space: 'O(b^m)',
  },
  {
    name: 'Weighted A* (W>1)',
    complete: 'Yes',
    optimal: 'Bounded suboptimal',
    time: 'O(b^m)',
    space: 'O(b^m)',
  },
  {
    name: 'IDA*',
    complete: 'Yes',
    optimal: 'Yes (if h admissible)',
    time: 'O(b^m)',
    space: 'O(bd)',
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Topic04InformedPage() {
  const [mapMode, setMapMode] = useState<'astar' | 'greedy'>('astar');

  return (
    <div className="prose">
      <h1>Topic 4: Informed Search</h1>
      <p className="lead">
        Blind search explores everywhere equally&mdash;it has no sense of
        direction. What if we could give our search algorithm a <em>compass</em>?
        That&rsquo;s the idea behind <strong>informed search</strong>: use
        domain knowledge to guide the search toward the goal, dramatically
        reducing wasted effort.
      </p>

      <TldrBox items={[
        'Heuristics estimate cost-to-goal, giving search a sense of direction',
        'Greedy Best-First Search is fast but not optimal — it chases the heuristic blindly',
        'A* = g(n) + h(n): optimal and complete when the heuristic is admissible (never overestimates)',
        'Better heuristics dramatically cut search effort — dominance matters',
      ]} />

      {/* ================================================================= */}
      {/* Section 4.1 */}
      {/* ================================================================= */}
      <section id="section-01" className="scroll-mt-6">
        <SectionHeader number="4.1" title="What If You Had a Compass?" />
        <p>
          In Topic 3 we saw BFS, DFS, and Uniform-Cost Search. They all share a
          critical limitation: they know <em>nothing</em> about where the goal is.
          UCS finds the cheapest path, but it fans out in every direction to do
          it&mdash;like searching for a friend&rsquo;s house by knocking on every
          door in a city.
        </p>
        <p>
          What if you had a rough estimate of how far you are from the goal? Not
          the exact distance&mdash;just a hint. In Romania, for example, you can
          look at a map and measure the <strong>straight-line distance</strong>{' '}
          from your current city to Bucharest. That straight-line distance
          won&rsquo;t tell you the road distance, but it gives you a
          <em> direction</em>.
        </p>

        <CalloutBox type="key-idea" title="Heuristic Function">
          <p>
            A <strong>heuristic function</strong> h(n) estimates the cost of the
            cheapest path from node n to the goal. It encodes domain knowledge
            that the search algorithm can exploit to find solutions faster.
          </p>
        </CalloutBox>

        <p>
          For our Romania map, the heuristic is the straight-line distance to
          Bucharest, written h<sub>SLD</sub>(n). For Arad, h<sub>SLD</sub> = 366.
          For Sibiu, it&rsquo;s 253. For Bucharest itself, it&rsquo;s 0. The
          search can use these values to decide which city to explore next.
        </p>

        <CodeBlock language="pseudocode" code={`function h_SLD(city):
  return straight_line_distance(city, Bucharest)

// Examples:
h_SLD(Arad)      = 366
h_SLD(Sibiu)     = 253
h_SLD(Fagaras)   = 176
h_SLD(Bucharest) = 0`} />

        <p>
          The key question is: <em>how</em> should we use h(n)? There are two
          main approaches&mdash;greedy search and A* search&mdash;and they
          differ in a surprisingly important way.
        </p>

        <QuizCard questions={QUIZ_41} />
      </section>

      {/* ================================================================= */}
      {/* Section 4.2 */}
      {/* ================================================================= */}
      <section id="section-02" className="scroll-mt-6">
        <SectionHeader number="4.2" title="Greedy Best-First Search" />
        <p>
          The simplest way to use a heuristic: always expand the node that
          <em> appears</em> closest to the goal. This is <strong>Greedy
          Best-First Search</strong>&mdash;it picks the node with the smallest
          h(n) and ignores everything else.
        </p>

        <CodeBlock language="pseudocode" code={`function GreedyBestFirst(start, goal, h):
  fringe = PriorityQueue ordered by h(n)
  fringe.insert(start, h(start))

  while fringe is not empty:
    node = fringe.pop()         // lowest h(n)
    if node == goal: return path
    for each neighbor of node:
      if neighbor not explored:
        fringe.insert(neighbor, h(neighbor))`} />

        <p>
          Try it on Romania below. Watch how Greedy follows the &ldquo;compass&rdquo;
          directly toward Bucharest&mdash;but it doesn&rsquo;t account for the
          actual road cost it has accumulated.
        </p>

        {/* Greedy map viz */}
        <AStarMapViz mode="greedy" />

        <CalloutBox type="warning" title="Greedy Is Not Optimal">
          <p>
            Greedy Best-First Search is <strong>not guaranteed to find the
            shortest path</strong>. It only cares about h(n)&mdash;the estimated
            remaining cost&mdash;and completely ignores g(n)&mdash;the cost
            already paid. A node might look close to the goal but sit at the end
            of an expensive detour.
          </p>
        </CalloutBox>

        <p>
          Greedy can also get stuck in loops on graphs without cycle detection,
          and its performance depends heavily on the quality of the heuristic.
          With a perfect heuristic, it goes straight to the goal. With a bad one,
          it can be worse than BFS.
        </p>

        <QuizCard questions={QUIZ_42} />
      </section>

      {/* ================================================================= */}
      {/* Section 4.3 */}
      {/* ================================================================= */}
      <section id="section-03" className="scroll-mt-6">
        <SectionHeader number="4.3" title="A* Search" />
        <p>
          Greedy ignores the past. UCS ignores the future. What if we combined
          both? That&rsquo;s exactly what <strong>A* Search</strong> does.
        </p>

        <CalloutBox type="key-idea" title="The A* Evaluation Function">
          <p>
            A* evaluates each node by:<br />
            <strong>f(n) = g(n) + h(n)</strong><br />
            where g(n) is the actual cost from start to n, and h(n) is the
            estimated cost from n to the goal.
          </p>
        </CalloutBox>

        <p>
          The insight is elegant: f(n) estimates the <em>total cost of the
          cheapest solution that passes through n</em>. By always expanding the
          node with the lowest f(n), A* combines the optimality guarantee of UCS
          with the speed of informed search.
        </p>

        <CodeBlock language="pseudocode" code={`function AStar(start, goal, h):
  fringe = PriorityQueue ordered by f(n) = g(n) + h(n)
  fringe.insert(start, f=0+h(start))

  while fringe is not empty:
    node = fringe.pop()         // lowest f(n)
    if node == goal: return path
    for each neighbor of node:
      g_new = g(node) + cost(node, neighbor)
      f_new = g_new + h(neighbor)
      if neighbor not explored:
        fringe.insert(neighbor, f=f_new)`} />

        <p>
          Watch A* in action on the Romania map. Notice how it finds the optimal
          path: Arad &rarr; Sibiu &rarr; Rimnicu Vilcea &rarr; Pitesti &rarr;
          Bucharest, with a total cost of <strong>418</strong>.
        </p>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', marginRight: '8px' }}>Algorithm:</label>
          <select
            value={mapMode}
            onChange={(e) => setMapMode(e.target.value as 'astar' | 'greedy')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontSize: '13px',
            }}
          >
            <option value="astar">A* Search</option>
            <option value="greedy">Greedy Best-First</option>
          </select>
        </div>
        <AStarMapViz mode={mapMode} />

        <p>
          Compare A* with Greedy using the dropdown above. Notice that A*
          explores more nodes than Greedy but finds the <em>optimal</em> path.
          Greedy may find a solution faster but often at higher cost.
        </p>

        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>City</th>
              <th>g(n)</th>
              <th>h(n)</th>
              <th>f(n)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Arad</td><td>0</td><td>366</td><td>366</td></tr>
            <tr><td>2</td><td>Sibiu</td><td>140</td><td>253</td><td>393</td></tr>
            <tr><td>3</td><td>Rimnicu Vilcea</td><td>220</td><td>193</td><td>413</td></tr>
            <tr><td>4</td><td>Pitesti</td><td>317</td><td>100</td><td>417</td></tr>
            <tr><td>5</td><td>Bucharest</td><td>418</td><td>0</td><td>418</td></tr>
          </tbody>
        </table>

        <QuizCard questions={QUIZ_43} />

        {/* TODO: Embed <HeuristicHustleGame /> here next week */}
      </section>

      {/* ================================================================= */}
      {/* Section 4.4 */}
      {/* ================================================================= */}
      <section id="section-04" className="scroll-mt-6">
        <SectionHeader number="4.4" title="Why A* Works: Admissibility" />
        <p>
          A* is optimal&mdash;but only if the heuristic satisfies a crucial
          condition. It must be <strong>admissible</strong>: it must never
          overestimate the true cost to reach the goal.
        </p>

        <CalloutBox type="key-idea" title="Admissibility">
          <p>
            A heuristic h(n) is <strong>admissible</strong> if for every node
            n:<br />
            <strong>h(n) &le; h*(n)</strong><br />
            where h*(n) is the true cheapest cost from n to the goal. An
            admissible heuristic is <em>optimistic</em>&mdash;it always
            believes things are at least as good as they actually are.
          </p>
        </CalloutBox>

        <p>
          Why does this matter? Consider what happens during A* search. When a
          node n appears at the front of the priority queue with f(n) = g(n) +
          h(n), we know:
        </p>
        <ul>
          <li>g(n) is the actual cost of the path we found to n.</li>
          <li>h(n) &le; h*(n), so f(n) &le; g(n) + h*(n) = the true cost of the best solution through n.</li>
          <li>If the optimal solution has cost C*, then for any node n on the optimal path, f(n) &le; C*.</li>
          <li>This means A* will always expand nodes on the optimal path before expanding the goal with a suboptimal cost.</li>
        </ul>

        <p>
          For Romania, h<sub>SLD</sub> is admissible because the straight-line
          distance between two points is always less than or equal to any path
          between them. You can&rsquo;t drive <em>shorter</em> than a straight
          line.
        </p>

        <h3>Consistency (Monotonicity)</h3>
        <p>
          A stronger condition is <strong>consistency</strong> (also called
          monotonicity). A heuristic is consistent if for every node n and
          successor n&prime; reached by action a:
        </p>

        <CodeBlock language="pseudocode" code={`// Consistency (triangle inequality):
h(n) <= cost(n, n') + h(n')

// This is like the triangle inequality from geometry:
// The estimate from n can't exceed the step cost
// plus the estimate from the next node.`} />

        <p>
          Consistency implies admissibility (but not vice versa). If h is
          consistent, the f-values along any path are non-decreasing, which means
          A* never needs to re-expand a node. This is why A* with a consistent
          heuristic is both optimal and efficient.
        </p>

        <CalloutBox type="tip">
          <p>
            Most practical admissible heuristics are also consistent. The
            straight-line distance h<sub>SLD</sub> is consistent because it
            satisfies the triangle inequality by definition of Euclidean
            geometry.
          </p>
        </CalloutBox>

        <QuizCard questions={QUIZ_44} />
      </section>

      {/* ================================================================= */}
      {/* Section 4.5 */}
      {/* ================================================================= */}
      <section id="section-05" className="scroll-mt-6">
        <SectionHeader number="4.5" title="Designing Heuristics" />
        <p>
          A* is only as good as its heuristic. A weak heuristic (like h = 0,
          which reduces A* to UCS) is admissible but uninformative. A strong
          heuristic guides the search directly to the goal. So how do you design
          a good one?
        </p>

        <h3>Case Study: The 8-Puzzle</h3>
        <p>
          The 8-puzzle is a classic testbed for heuristics. The goal is to slide
          tiles into order. Two natural heuristics stand out:
        </p>
        <ul>
          <li>
            <strong>h1: Misplaced Tiles</strong>&mdash;Count how many tiles are
            not in their goal position. Simple, but crude.
          </li>
          <li>
            <strong>h2: Manhattan Distance</strong>&mdash;For each tile, count
            the minimum number of moves (up/down/left/right) to reach its goal
            position, and sum them all up.
          </li>
        </ul>

        <p>
          Both are admissible: each tile needs <em>at least</em> one move to get
          to its goal position (h1), and at least its Manhattan distance worth of
          moves (h2). Neither overestimates.
        </p>

        <CalloutBox type="key-idea" title="Dominance">
          <p>
            Heuristic h2 <strong>dominates</strong> h1 if h2(n) &ge; h1(n) for
            all n, and both are admissible. A dominating heuristic is always
            at least as informative, so A* with h2 never expands more nodes
            than A* with h1. <strong>More informed = fewer nodes expanded.</strong>
          </p>
        </CalloutBox>

        <p>
          Try the interactive 8-puzzle below. As you move tiles, watch how h1
          and h2 change. Notice that h2 &ge; h1 always holds.
        </p>

        <EightPuzzleViz />

        <h3>How to Invent Heuristics: Relaxation</h3>
        <p>
          A powerful technique is <strong>problem relaxation</strong>. Remove
          some constraints from the problem and solve the easier version:
        </p>
        <ul>
          <li>
            If a tile could move to any adjacent square (even if occupied),
            the solution cost is the Manhattan distance &rarr; h2.
          </li>
          <li>
            If a tile could teleport to its goal position in one step,
            the solution cost is the number of misplaced tiles &rarr; h1.
          </li>
        </ul>
        <p>
          The cost of the optimal solution to a <em>relaxed</em> problem is
          always a lower bound on the original&mdash;making it automatically
          admissible. This is the most common way to derive heuristics in
          practice.
        </p>

        <QuizCard questions={QUIZ_45} />
      </section>

      {/* ================================================================= */}
      {/* Section 4.6 */}
      {/* ================================================================= */}
      <section id="section-06" className="scroll-mt-6">
        <SectionHeader number="4.6" title="The Pathfinding Playground" />
        <p>
          Theory is great, but nothing beats seeing these algorithms race on the
          same problem. The playground below lets you draw walls on a grid and
          run BFS, Greedy Best-First Search, or A* side by side.
        </p>
        <p>
          <strong>Things to try:</strong>
        </p>
        <ul>
          <li>Draw a simple wall between start and end. Run all three algorithms and compare how many cells each visits.</li>
          <li>Click &ldquo;Random Maze&rdquo; for a more complex obstacle layout.</li>
          <li>Notice that <strong>BFS</strong> fans out uniformly (it explores a lot of cells, but finds the shortest path).</li>
          <li><strong>Greedy</strong> dives toward the goal fast but its path can be suboptimal, especially around walls.</li>
          <li><strong>A*</strong> finds the optimal path while exploring far fewer cells than BFS.</li>
        </ul>

        <PathfindingGridViz />

        <CalloutBox type="tip">
          <p>
            After running a search, use &ldquo;Clear Search&rdquo; (not
            &ldquo;Clear All&rdquo;) to keep your walls and try a different
            algorithm on the same layout.
          </p>
        </CalloutBox>
      </section>

      {/* ================================================================= */}
      {/* Section 4.7 */}
      {/* ================================================================= */}
      <section id="section-07" className="scroll-mt-6">
        <SectionHeader number="4.7" title="Beyond A*: Weighted Search & Variants" />
        <p>
          A* is optimal, but optimality has a price. In the worst case, A* must
          explore exponentially many nodes. For real-time applications like
          video-game pathfinding or robotics, you might prefer a <em>nearly</em>
          {' '}optimal solution found ten times faster.
        </p>

        <h3>Weighted A*</h3>
        <p>
          Weighted A* (also called WA*) modifies the evaluation function to:
        </p>

        <CodeBlock language="pseudocode" code={`f(n) = g(n) + W * h(n)    where W >= 1

// W = 1  => standard A*
// W > 1  => more aggressive, faster, bounded suboptimal
// W → ∞  => approaches Greedy Best-First Search`} />

        <p>
          The weight W amplifies the heuristic, making the search more
          &ldquo;greedy.&rdquo; The tradeoff is clean: the solution cost is
          guaranteed to be at most W times the optimal cost. You choose how much
          optimality to sacrifice for speed.
        </p>

        <CalloutBox type="info" title="Bounded Suboptimality">
          <p>
            With Weighted A* using weight W, the solution cost C satisfies:<br />
            <strong>C &le; W &middot; C*</strong><br />
            where C* is the optimal cost. For W = 1.5, you&rsquo;re guaranteed
            to be within 50% of optimal, often much better in practice.
          </p>
        </CalloutBox>

        <h3>Other A* Variants</h3>
        <ul>
          <li>
            <strong>IDA* (Iterative Deepening A*)</strong>&mdash;Combines A*
            with iterative deepening. Uses f(n) as the depth limit instead of
            tree depth. Gets A*&rsquo;s optimality with linear space complexity
            O(bd) instead of exponential O(b<sup>m</sup>).
          </li>
          <li>
            <strong>SMA* (Simplified Memory-Bounded A*)</strong>&mdash;Drops
            the worst node when memory is full, using available memory as
            efficiently as possible.
          </li>
          <li>
            <strong>RBFS (Recursive Best-First Search)</strong>&mdash;A linear-space
            algorithm that mimics best-first search using recursive calls,
            keeping track of the f-value of the best alternative path.
          </li>
        </ul>

        <h3>Comparison of Informed Search Algorithms</h3>
        <PropertiesTable data={ALGO_PROPERTIES} />
        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
          * Greedy is complete on finite spaces with cycle detection, but can loop otherwise.
          b = branching factor, m = maximum depth, d = solution depth.
        </p>

        <h3>Summary</h3>
        <p>
          Informed search is one of the most important ideas in AI. By
          injecting a little domain knowledge through a heuristic function, we
          can dramatically reduce search effort. A* with an admissible heuristic
          is the gold standard for optimal search. When optimality can be
          relaxed, Weighted A* and its variants offer a smooth tradeoff between
          solution quality and computation.
        </p>

        <CalloutBox type="key-idea" title="The Informed Search Hierarchy">
          <p>
            UCS (h=0) &sub; A* (h admissible) &sub; Weighted A* (bounded
            suboptimal) &sub; Greedy (h only). As you add more heuristic
            influence, search gets faster but you sacrifice optimality
            guarantees. Choose the right point on this spectrum for your
            application.
          </p>
        </CalloutBox>

        <QuizCard questions={QUIZ_47} />

        <div className="not-prose mt-6">
          <Link to="/topic-05" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors no-underline">
            Next up: Local Search &amp; Optimization &rarr;
          </Link>
        </div>
      </section>

    </div>
  );
}
