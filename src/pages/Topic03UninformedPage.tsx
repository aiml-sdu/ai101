import { lazy, Suspense } from 'react';
import SectionHeader from '../components/SectionHeader.tsx';
import QuizCard, { type QuizQuestion } from '../components/QuizCard.tsx';
import CalloutBox from '../components/CalloutBox.tsx';
import TldrBox from '../components/TldrBox.tsx';
import PropertiesTable, { type AlgoProperty } from '../components/PropertiesTable.tsx';
import { M } from '../components/Math.tsx';
import AlgorithmBox from '../components/AlgorithmBox.tsx';
import ClozeCodeExercise, { type ClozeLine } from '../components/ClozeCodeExercise.tsx';
import RomaniaMapViz from './visualizations/RomaniaMapViz.tsx';
import InteractiveTreeViz from './visualizations/InteractiveTreeViz.tsx';
import SearchTreeViz from './visualizations/SearchTreeViz.tsx';
import SearchMapViz from './visualizations/SearchMapViz.tsx';
import SideBySideViz from './visualizations/SideBySideViz.tsx';
import BeTheAlgorithmGame from './visualizations/BeTheAlgorithmGame.tsx';
import FlashcardDeck from '../components/FlashcardDeck.tsx';
import ClozeText from '../components/ClozeText.tsx';
import { TOPIC_03_FLASHCARDS, TOPIC_03_CLOZE } from '../data/study/topic-03-study.ts';
import TierDivider from '../components/TierDivider.tsx';
import HookQuestion from '../components/HookQuestion.tsx';
import LabProgressBar from '../components/LabProgressBar.tsx';
import Exercise1GraphTraversal from './visualizations/lab/Exercise1GraphTraversal.tsx';
import Exercise2VacuumWorld from './visualizations/lab/Exercise2VacuumWorld.tsx';
import Exercise3RiverCrossing from './visualizations/lab/Exercise3RiverCrossing.tsx';

const FringeFrenzyGame = lazy(() => import('./visualizations/FringeFrenzyGame.tsx'));

// ---- Quiz data ----

const QUIZ_S2: QuizQuestion[] = [
  {
    id: 't03-q01',
    question: "In a search problem, the 'state space' is:",
    options: [
      'The initial state only',
      'The set of all reachable states',
      'The goal state',
      'The set of actions',
    ],
    correctIndex: 1,
    explanation: 'The state space is the complete graph of all states reachable from the initial state through any sequence of actions.',
  },
  {
    id: 't03-q02',
    question: "For the Romania road trip problem, an 'action' is:",
    options: [
      'Arriving at Bucharest',
      'Driving from one city to a connected city',
      'The total distance traveled',
      'The straight-line distance to the goal',
    ],
    correctIndex: 1,
    explanation: 'Actions move the agent from one state to another. In this problem, each action is driving along a road from one city to a directly connected city.',
  },
  {
    id: 't03-q03',
    question: 'In the 8-puzzle, the cost of each action (moving a tile) is:',
    options: [
      'Equal to the tile number',
      '1 for every move',
      'The Manhattan distance',
      'Variable depending on direction',
    ],
    correctIndex: 1,
    explanation: 'In the standard 8-puzzle formulation, every tile move costs 1, regardless of which tile is moved or in what direction.',
  },
];

const QUIZ_S3: QuizQuestion[] = [
  {
    id: 't03-q04',
    question: 'The fringe (frontier) in tree search contains:',
    options: [
      'All nodes in the tree',
      'Nodes that have been expanded',
      'Nodes that are waiting to be expanded',
      'Only the goal node',
    ],
    correctIndex: 2,
    explanation: 'The fringe contains nodes that have been generated but not yet expanded. These are the candidates for the next expansion step.',
  },
  {
    id: 't03-q05',
    question: 'What determines the difference between BFS, DFS, and UCS?',
    options: [
      'The tree structure',
      'How the next node is selected from the fringe',
      'The number of nodes in the tree',
      'The goal test function',
    ],
    correctIndex: 1,
    explanation: 'All uninformed search algorithms use the same basic tree search skeleton. The only difference is the order in which they select nodes from the fringe.',
  },
];

const QUIZ_S4: QuizQuestion[] = [
  {
    id: 't03-q06',
    question: 'In BFS, the fringe is implemented as:',
    options: [
      'A stack (LIFO)',
      'A queue (FIFO)',
      'A priority queue',
      'A random bag',
    ],
    correctIndex: 1,
    explanation: 'BFS uses a FIFO queue. New nodes go to the back of the queue, so shallower nodes are always expanded before deeper ones.',
  },
  {
    id: 't03-q07',
    question: 'BFS is optimal when:',
    options: [
      'All step costs are equal',
      'The tree is balanced',
      'The branching factor is small',
      'The goal is at maximum depth',
    ],
    correctIndex: 0,
    explanation: 'BFS finds the shallowest solution first. This is only guaranteed to be optimal when all step costs are equal (cost = 1 per step). With unequal costs, a deeper path might be cheaper.',
  },
];

const QUIZ_S5: QuizQuestion[] = [
  {
    id: 't03-q08',
    question: 'DFS can fail to find a solution when:',
    options: [
      'The goal is at the root',
      'The tree has infinite branches',
      'All step costs are equal',
      'The branching factor is 2',
    ],
    correctIndex: 1,
    explanation: 'DFS follows a single path to its maximum depth before backtracking. If a branch is infinitely deep (or very deep), DFS can get stuck and never reach the goal on another branch.',
  },
  {
    id: 't03-q09',
    question: 'The main advantage of DFS over BFS is:',
    options: [
      'It always finds the optimal solution',
      'It uses much less memory',
      "It's always faster",
      "It's complete",
    ],
    correctIndex: 1,
    explanation: "DFS only stores nodes along the current path plus their siblings: O(bm) space vs O(b^d) for BFS. This can be a massive difference for large trees.",
  },
  {
    id: 't03-q10',
    question: 'Iterative Deepening Search combines:',
    options: [
      "BFS's optimality with DFS's speed",
      "BFS's completeness and optimality with DFS's space efficiency",
      "DFS's completeness with BFS's memory",
      'Random search with systematic search',
    ],
    correctIndex: 1,
    explanation: "IDS runs DFS with increasing depth limits (1, 2, 3...). It finds the shallowest solution (like BFS) while using only O(bd) memory (like DFS). The overhead of re-expanding shallow nodes is small because most nodes are at the deepest level.",
  },
];

const QUIZ_S6: QuizQuestion[] = [
  {
    id: 't03-q11',
    question: 'UCS selects the next node to expand based on:',
    options: [
      'Depth in the tree',
      'The heuristic estimate h(n)',
      'The total path cost g(n)',
      'Random selection',
    ],
    correctIndex: 2,
    explanation: 'UCS uses a priority queue ordered by g(n), the total cost of the path from the start to node n. This ensures it always expands the cheapest unexpanded node.',
  },
  {
    id: 't03-q12',
    question: 'UCS is guaranteed to find the optimal solution because:',
    options: [
      'It uses a heuristic',
      'It expands nodes in order of increasing path cost',
      'It explores all nodes',
      'It uses depth-first search',
    ],
    correctIndex: 1,
    explanation: 'By always expanding the node with the lowest path cost, UCS guarantees that when it first reaches the goal, no unexpanded path could be cheaper.',
  },
];

const QUIZ_S7: QuizQuestion[] = [
  {
    id: 't03-q13',
    question: 'If memory is your primary concern, which algorithm should you use?',
    options: ['BFS', 'DFS', 'IDS', 'UCS'],
    correctIndex: 2,
    explanation: "IDS uses O(bd) space -- the best of all four algorithms. It combines BFS's completeness with DFS's memory efficiency.",
  },
  {
    id: 't03-q14',
    question: 'Which algorithm would you choose for finding the cheapest route in a weighted graph?',
    options: ['BFS', 'DFS', 'IDS', 'UCS'],
    correctIndex: 3,
    explanation: 'UCS is the only algorithm here that considers edge weights. It finds the optimal path by expanding nodes in order of total path cost.',
  },
  {
    id: 't03-q15',
    question: 'All uninformed search algorithms share what limitation?',
    options: [
      'They use too much memory',
      "They can't handle weighted graphs",
      'They explore without any sense of direction toward the goal',
      'They always find suboptimal solutions',
    ],
    correctIndex: 2,
    explanation: "Uninformed search algorithms have no information about which direction the goal lies. They explore blindly, which leads to exponential time complexity. This motivates informed search (next topic).",
  },
];

// ---- Properties table data ----

const BFS_PROPS: AlgoProperty[] = [
  { name: 'BFS', complete: 'Yes', optimal: 'Yes*', time: 'O(b^d)', space: 'O(b^d)' },
];

const DFS_PROPS: AlgoProperty[] = [
  { name: 'DFS', complete: 'No', optimal: 'No', time: 'O(b^m)', space: 'O(bm)' },
];

const UCS_PROPS: AlgoProperty[] = [
  { name: 'UCS', complete: 'Yes', optimal: 'Yes', time: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})', space: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})' },
];

const ALL_PROPS: AlgoProperty[] = [
  { name: 'BFS', complete: 'Yes', optimal: 'Yes*', time: 'O(b^d)', space: 'O(b^d)' },
  { name: 'DFS', complete: 'No', optimal: 'No', time: 'O(b^m)', space: 'O(bm)' },
  { name: 'IDS', complete: 'Yes', optimal: 'Yes*', time: 'O(b^d)', space: 'O(bd)' },
  { name: 'UCS', complete: 'Yes', optimal: 'Yes', time: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})', space: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})' },
];

// ---- Cloze exercise data ----

const CLOZE_TREE_SEARCH: ClozeLine[] = [
  { type: 'static', content: 'function TREE-SEARCH(problem, fringe):' },
  { type: 'blank', id: 'ct-l1', answer: '  fringe.INSERT(MAKE-NODE(problem.initial-state))' },
  { type: 'static', content: '  loop:' },
  { type: 'blank', id: 'ct-l2', answer: '    if fringe is empty: return failure' },
  { type: 'blank', id: 'ct-l3', answer: '    node \u2190 fringe.REMOVE-FRONT()' },
  { type: 'blank', id: 'ct-l4', answer: '    if problem.GOAL-TEST(node.state): return node' },
  { type: 'blank', id: 'ct-l5', answer: '    fringe.INSERT-ALL(EXPAND(node, problem))' },
];

export default function Topic03UninformedPage() {
  return (
    <div className="prose">
      <h1>Topic 3: Solving Problems by Searching</h1>
      <p className="lead">
        How does an AI find the best route, solve a puzzle, or plan a sequence of moves?
        It searches. This topic introduces the fundamental search algorithms that power
        everything from GPS navigation to game-playing programs.
      </p>

      <HookQuestion
        question="Dozens of routes from Arad to Bucharest — how do you find the best one without already knowing the answer?"
        subtext="Search algorithms explore possibilities systematically so you don't have to."
      />

      <TldrBox items={[
        'Search problems have states, actions, a transition model, and a goal test',
        'BFS finds the shallowest goal; DFS uses less memory but may not find the shortest path',
        'Uniform-Cost Search (UCS) finds the cheapest path by expanding lowest-cost nodes first',
        'Iterative Deepening combines BFS optimality with DFS memory efficiency',
      ]} />

      {/* ── First Principles ── */}
      <TierDivider tier="first-principles" />
      <section id="section-first-principles" className="scroll-mt-6">
        <SectionHeader number="3.1" title="First Principles" />

        <h3>Framing Problems as Search</h3>
        <p>
          Before we can solve a problem, we need a precise way to describe it. In AI, we
          frame problems as <strong>search problems</strong> with four components:
        </p>
        <ul>
          <li><strong>Initial state</strong> &mdash; where we start (e.g., &ldquo;In Arad&rdquo;)</li>
          <li><strong>Actions</strong> &mdash; what we can do from any state (e.g., &ldquo;Drive to a connected city&rdquo;)</li>
          <li><strong>Goal test</strong> &mdash; how we know we are done (e.g., &ldquo;Am I in Bucharest?&rdquo;)</li>
          <li><strong>Path cost</strong> &mdash; the total cost of a sequence of actions (e.g., total km driven)</li>
        </ul>
        <p>
          The <strong>state space</strong> is the set of all states reachable from the initial
          state through any sequence of actions. For Romania, the state space is all 20 cities.
          For the <strong>8-puzzle</strong>, the state space is all possible tile configurations.
          For a <strong>vacuum world</strong>, it is every combination of dirt and robot positions.
        </p>
        <p>
          This formalization is powerful: once you describe <em>any</em> problem in these terms,
          you can apply the same search algorithms to solve it.
        </p>

        <h3>The Tree Search Algorithm</h3>
        <p>
          At the heart of every search algorithm is the <strong>fringe</strong> (also called the
          <strong> frontier</strong>): a collection of nodes waiting to be expanded. We start with
          just the initial state in the fringe. At each step, we pick a node from the fringe,
          check if it is the goal, and if not, expand it by generating its successors and adding
          them to the fringe.
        </p>
        <CalloutBox type="key-idea">
          <p>Tree search is the skeleton of every search algorithm. BFS, DFS,
            A* &mdash; they all just differ in <em>how they pick the next node</em> from the fringe.</p>
        </CalloutBox>
        <AlgorithmBox number={1} title="Tree-Search">
{`function TREE-SEARCH(problem, fringe):
  fringe.INSERT(MAKE-NODE(problem.initial-state))
  loop:
    if fringe is empty: return failure
    node $\\leftarrow$ fringe.REMOVE-FRONT()
    if problem.GOAL-TEST(node.state):
      return node
    fringe.INSERT-ALL(EXPAND(node, problem))`}
        </AlgorithmBox>
      </section>

      {/* ── Feynman / Intuitive Explanation ── */}
      <TierDivider tier="feynman" />
      <section id="section-feynman" className="scroll-mt-6">
        <SectionHeader number="3.2" title="Intuitive Explanation" />

        <h3>Planning a Road Trip</h3>
        <p>
          Imagine you are in <strong>Arad</strong>, Romania, and you need to drive to
          <strong> Bucharest</strong>. You have a map showing cities connected by roads,
          each with a distance. How do you find the best route? This seemingly simple
          question is the foundation of <em>search</em> in AI &mdash; and the algorithms
          we develop here power everything from GPS navigation to game-playing programs.
        </p>
        <p>
          Below is the Romania road map from Russell &amp; Norvig&rsquo;s textbook. Each circle
          is a city; each line is a road with its distance in kilometers. <strong>Arad</strong>
          {' '}is highlighted in green (start) and <strong>Bucharest</strong> in red (goal).
          Hover over any city to see its straight-line distance to Bucharest.
        </p>
        <RomaniaMapViz />

        <h3>Breadth-First Search</h3>
        <p>
          Breadth-First Search (BFS) explores the tree level by level. It uses a <strong>FIFO
          queue</strong>: new nodes go to the back of the fringe, so shallower nodes are always
          expanded before deeper ones. Think of it as exploring in concentric waves outward from
          the start.
        </p>
        <SearchTreeViz algorithm="bfs" label="BFS on Tree (Goal: G)" fringeLabel="Fringe (Queue)" />

        <h3>Depth-First Search</h3>
        <p>
          Depth-First Search (DFS) dives as deep as possible before backtracking. It uses a
          <strong> LIFO stack</strong>: the most recently generated node is expanded first. This
          means DFS races down the leftmost branch, only backtracking when it hits a dead end.
        </p>
        <SearchTreeViz algorithm="dfs" label="DFS on Tree (Goal: G)" fringeLabel="Fringe (Stack, top first)" />

        <h4>BFS vs DFS: Side by Side</h4>
        <p>
          Below, both algorithms explore the <em>same tree</em> simultaneously. Step through
          to see how BFS (left) expands level-by-level while DFS (right) dives deep first.
        </p>
        <SideBySideViz />

        <h4>Iterative Deepening Search</h4>
        <p>
          <strong>Iterative Deepening Search (IDS)</strong> gets the best of both worlds. It
          runs DFS with a depth limit of 1, then 2, then 3, and so on. Each iteration uses
          <M>{"O(bd)"}</M> memory (like DFS), but by increasing the limit it guarantees finding the
          shallowest solution (like BFS). The overhead of re-expanding shallow nodes is small
          because most nodes live at the deepest level of the tree.
        </p>
        <CalloutBox type="tip">
          <p>DFS uses much less memory than BFS &mdash; <M>{"O(bm)"}</M> vs <M>{"O(b^d)"}</M>.
            But it can get stuck in infinite branches and may miss shallower solutions.
            IDS solves this by combining the best of both.</p>
        </CalloutBox>
      </section>

      {/* ── Advanced / Technical ── */}
      <TierDivider tier="advanced" />
      <section id="section-advanced" className="scroll-mt-6">
        <SectionHeader number="3.3" title="Advanced / Technical" />

        <h3>Complete the Tree Search Algorithm</h3>
        <ClozeCodeExercise
          title="Complete the Tree Search Algorithm"
          lines={CLOZE_TREE_SEARCH}
        />
        <p>
          Try it yourself: click on nodes in the fringe (highlighted with a dashed border) to
          expand them. Watch how the fringe grows as you explore the tree. The goal is node
          <strong> G</strong> (marked in blue when found).
        </p>
        <InteractiveTreeViz />

        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
          <FringeFrenzyGame />
        </Suspense>

        <h3>Algorithm Properties</h3>
        <h4>Breadth-First Search</h4>
        <PropertiesTable data={BFS_PROPS} />
        <p>
          <em>* Optimal only when all step costs are equal.</em>
        </p>
        <CalloutBox type="key-idea">
          <p>Space is BFS&rsquo;s Achilles heel. It must store every node at the
            current depth, which grows exponentially. For branching factor <M>{"b"}</M> and solution depth <M>{"d"}</M>,
            BFS needs <M>{"O(b^d)"}</M> memory.</p>
        </CalloutBox>

        <h4>Depth-First Search</h4>
        <PropertiesTable data={DFS_PROPS} />

        <h3>Uniform-Cost Search</h3>
        <p>
          What happens when roads have different lengths? BFS treats every step equally, but
          a two-step path through highways might be shorter than a one-step path through
          mountains. <strong>Uniform-Cost Search (UCS)</strong> fixes this by always expanding
          the node with the lowest <em>total path cost</em>.
        </p>
        <CalloutBox type="key-idea">
          <p>UCS expands the node with the lowest total path cost <M>{"g(n)"}</M>. The fringe
            is a <strong>priority queue</strong> ordered by <M>{"g(n)"}</M>. When all step costs are equal,
            UCS behaves exactly like BFS.</p>
        </CalloutBox>
        <SearchMapViz />
        <PropertiesTable data={UCS_PROPS} />

        <h3>Comparing Strategies</h3>
        <p>
          Now let&rsquo;s put it all together. The table below compares the four uninformed search
          strategies across the dimensions that matter: completeness, optimality, time, and
          space. Here <M>{"b"}</M> is the branching factor, <M>{"d"}</M> is the
          depth of the shallowest solution, and <M>{"m"}</M> is the maximum depth.
        </p>
        <PropertiesTable data={ALL_PROPS} />
        <p>
          <em>* Optimal only when all step costs are equal.</em>
        </p>
        <p>
          Think you understand the difference? Prove it. In the game below, <strong>you</strong> are
          the algorithm. Click nodes in the exact order that BFS or DFS would expand them.
        </p>
        <BeTheAlgorithmGame />
        <CalloutBox type="key-idea">
          <p>No free lunch &mdash; every strategy makes a trade-off between
            completeness, optimality, time, and space. But notice that all of them explore
            <em> blindly</em>. What if we could be smarter about where to look? That is the
            motivation for <strong>informed search</strong> (next topic).</p>
        </CalloutBox>
      </section>

      {/* ── Check Your Understanding (MCQ) ── */}
      <TierDivider tier="quiz" />
      <section id="section-quiz" className="scroll-mt-6">
        <SectionHeader number="3.4" title="Check Your Understanding" />
        <h3>Search Formulation</h3>
        <QuizCard questions={[...QUIZ_S2, ...QUIZ_S3]} />
        <h3>BFS &amp; DFS</h3>
        <QuizCard questions={[...QUIZ_S4, ...QUIZ_S5]} />
        <h3>UCS &amp; Comparison</h3>
        <QuizCard questions={[...QUIZ_S6, ...QUIZ_S7]} />
      </section>

      {/* ── Fill in the Blanks (Cloze) ── */}
      <TierDivider tier="cloze" />
      <section id="section-cloze" className="scroll-mt-6">
        <SectionHeader number="3.5" title="Fill in the Blanks" />
        <p>Test your recall by filling in the missing terms.</p>
        <div className="not-prose">
          {TOPIC_03_CLOZE.map((ex) => <ClozeText key={ex.id} exercise={ex} />)}
        </div>
      </section>

      {/* ── Lab Exercises ── */}
      <TierDivider tier="lab" label="Lab 2: Practice" />
      <section id="section-lab" className="scroll-mt-6">
        <LabProgressBar
          exercises={[
            { id: 'lab-t03-ex1', steps: 4, label: 'Exercise 1' },
            { id: 'lab-t03-ex2', steps: 3, label: 'Exercise 2' },
            { id: 'lab-t03-ex3', steps: 3, label: 'Exercise 3' },
          ]}
        />
        <Exercise1GraphTraversal />
        <Exercise2VacuumWorld />
        <Exercise3RiverCrossing />
      </section>

      {/* ── Extra Exercises ── */}
      <TierDivider tier="extra" />
      <section id="section-extra" className="scroll-mt-6">
        <SectionHeader number="3.6" title="Extra Exercises" />
        <p>Review key concepts with flashcards for spaced repetition.</p>
        <div className="not-prose">
          <FlashcardDeck cards={TOPIC_03_FLASHCARDS} topicId="topic-03" compact />
        </div>
      </section>
    </div>
  );
}
