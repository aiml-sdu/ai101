import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.tsx';
import QuizCard, { type QuizQuestion } from '../components/QuizCard.tsx';
import CalloutBox from '../components/CalloutBox.tsx';
import TldrBox from '../components/TldrBox.tsx';
import VacuumWorldViz from './visualizations/VacuumWorldViz.tsx';
import VacuumSimulationViz from './visualizations/VacuumSimulationViz.tsx';
import PEASBuilder from './visualizations/PEASBuilder.tsx';
import EnvironmentClassifier from './visualizations/EnvironmentClassifier.tsx';

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

const QUIZ_S02: QuizQuestion[] = [
  {
    id: 't02-s02-q1',
    question: "An agent's 'percept sequence' refers to:",
    options: [
      'The current sensor reading',
      'The complete history of all sensor readings',
      'The list of available actions',
      "The agent's internal state",
    ],
    correctIndex: 1,
    explanation:
      "The percept sequence is the complete history of everything the agent has ever perceived. This matters because rational decisions may depend on past observations, not just the current one.",
  },
  {
    id: 't02-s02-q2',
    question:
      'The difference between an agent function and an agent program is:',
    options: [
      'There is no difference',
      'The function is the specification; the program is the implementation',
      'The function runs faster than the program',
      'The program is always optimal; the function is approximate',
    ],
    correctIndex: 1,
    explanation:
      "The agent function is the ideal mathematical mapping from percept sequences to actions. The agent program is the actual code that runs on hardware \u2014 it's our best attempt at implementing the function.",
  },
];

const QUIZ_S03: QuizQuestion[] = [
  {
    id: 't02-s03-q1',
    question: 'A rational agent must:',
    options: [
      'Always succeed at its task',
      'Know everything about its environment',
      'Act to maximize its expected performance',
      'Never make mistakes',
    ],
    correctIndex: 2,
    explanation:
      "Rationality means maximizing expected performance given available information. A rational agent doesn't need to be omniscient or always succeed \u2014 it just needs to make the best decisions possible.",
  },
  {
    id: 't02-s03-q2',
    question:
      'An agent that always vacuums when it senses dirt is rational if:',
    options: [
      'It always cleans all the dirt',
      'The performance measure rewards clean floors and it has no better action available',
      'It never makes mistakes',
      'It can see both rooms at once',
    ],
    correctIndex: 1,
    explanation:
      "Rationality depends on the performance measure and available information. If cleaning when dirt is sensed maximizes expected performance given what the agent knows, then it's rational.",
  },
];

const QUIZ_S04: QuizQuestion[] = [
  {
    id: 't02-s04-q1',
    question: "In the PEAS framework, the 'E' stands for:",
    options: ['Efficiency', 'Environment', 'Evaluation', 'Execution'],
    correctIndex: 1,
    explanation:
      'PEAS = Performance measure, Environment, Actuators, Sensors. The Environment describes the world in which the agent operates.',
  },
  {
    id: 't02-s04-q2',
    question: 'For a chess-playing agent, which of these is an actuator?',
    options: [
      'The chess clock',
      "The opponent's moves",
      'Moving a piece on the board',
      'The current board position',
    ],
    correctIndex: 2,
    explanation:
      "Actuators are the means by which an agent acts on its environment. In chess, the actuator is the ability to move pieces. The board position is a percept, the opponent's moves are part of the environment, and the clock is a constraint.",
  },
];

const QUIZ_S05: QuizQuestion[] = [
  {
    id: 't02-s05-q1',
    question: 'Chess is best described as:',
    options: [
      'Fully observable, deterministic, sequential',
      'Partially observable, stochastic, episodic',
      'Fully observable, stochastic, sequential',
      'Partially observable, deterministic, episodic',
    ],
    correctIndex: 0,
    explanation:
      'In chess, you can see the entire board (fully observable), moves have predictable outcomes (deterministic), and current moves affect future positions (sequential).',
  },
  {
    id: 't02-s05-q2',
    question:
      'Which property makes poker fundamentally harder than chess for an AI agent?',
    options: [
      "It's multi-agent",
      "It's partially observable",
      "It's sequential",
      "It's discrete",
    ],
    correctIndex: 1,
    explanation:
      "The key difference is that in poker, you can't see your opponents' cards. This partial observability forces the agent to reason under uncertainty, making it fundamentally harder.",
  },
  {
    id: 't02-s05-q3',
    question:
      'A medical diagnosis system operates in what kind of environment?',
    options: [
      'Fully observable, deterministic',
      'Partially observable, stochastic',
      'Fully observable, stochastic',
      'Partially observable, deterministic',
    ],
    correctIndex: 1,
    explanation:
      "A doctor can't observe all internal states of a patient (partially observable), and treatments don't have guaranteed outcomes (stochastic).",
  },
];

const QUIZ_S06: QuizQuestion[] = [
  {
    id: 't02-s06-q1',
    question: 'A simple reflex agent decides what to do based on:',
    options: [
      'The current percept only',
      'The complete percept history',
      'An explicit goal',
      'A utility function',
    ],
    correctIndex: 0,
    explanation:
      'Simple reflex agents use condition-action rules based only on the current percept. They have no memory of past percepts.',
  },
  {
    id: 't02-s06-q2',
    question:
      'What advantage does a model-based agent have over a simple reflex agent?',
    options: [
      "It's faster",
      'It can handle partially observable environments',
      'It always finds the optimal solution',
      "It doesn't need sensors",
    ],
    correctIndex: 1,
    explanation:
      "Model-based agents maintain internal state that tracks aspects of the world they can't currently see. This lets them operate in partially observable environments where simple reflex agents would fail.",
  },
  {
    id: 't02-s06-q3',
    question:
      'A utility-based agent differs from a goal-based agent because it:',
    options: [
      'Has no goals',
      'Can compare different ways of achieving a goal',
      "Doesn't need sensors",
      'Only works in deterministic environments',
    ],
    correctIndex: 1,
    explanation:
      'While a goal-based agent can determine if a state satisfies its goal (binary yes/no), a utility-based agent can rank states by how desirable they are. This lets it choose the best among multiple goal-achieving plans.',
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Topic02AgentsPage() {
  return (
    <div className="prose">
      <TldrBox items={[
        'Agents perceive via sensors and act via actuators; PEAS defines their task',
        'Rational agents maximize expected performance — they don\'t need to be perfect',
        'Environments vary: fully/partially observable, deterministic/stochastic, static/dynamic',
        'Agent types range from simple reflex to utility-based and learning agents',
      ]} />

      {/* Section 2.1: The Robot Vacuum Problem */}
      <section id="section-01" className="scroll-mt-6">
        <SectionHeader number="2.1" title="The Robot Vacuum Problem" />
        <p className="lead">
          Your Roomba bumps into a wall, turns, vacuums dirt, returns to its dock.
          It senses, decides, acts. But is it <em>intelligent</em>?
        </p>
        <p>
          To answer that question, let&rsquo;s strip the problem down to its simplest possible form.
          Forget about furniture, battery life, and floor plans. Imagine the vacuum lives in a
          tiny world: just <strong>two rooms</strong> (A and B), each either clean or dirty. The
          vacuum can sense which room it&rsquo;s in and whether there&rsquo;s dirt. It can do three things:
          {' '}<strong>move left</strong>, <strong>move right</strong>, or <strong>suck</strong>.
        </p>
        <p>
          This absurdly simple setup is the foundation of one of AI&rsquo;s most important
          ideas. Every real-world intelligent system &mdash; from self-driving cars to medical
          diagnosis tools &mdash; is, at its core, a more elaborate version of this vacuum cleaner.
        </p>

        <VacuumWorldViz />

        <p>
          Watch the agent above. It moves between rooms, checks for dirt, and cleans.
          This is the sense-decide-act loop in its purest form &mdash; and it&rsquo;s the
          pattern we&rsquo;ll see in every intelligent system we study in this course.
        </p>
      </section>

      {/* Section 2.2: Agents — Sense, Think, Act */}
      <section id="section-02" className="scroll-mt-6">
        <SectionHeader number="2.2" title="Agents: Sense, Think, Act" />
        <p className="lead">
          Every intelligent system follows the same loop: <strong>perceive</strong> the
          environment through sensors, <strong>decide</strong> what to do, and
          {' '}<strong>act</strong> on the environment through actuators.
        </p>
        <p>
          In AI, we call this an <strong>agent</strong>. An agent is anything that perceives
          its environment through sensors and acts upon it through actuators. Your vacuum
          cleaner is an agent. A self-driving car is an agent. A chess program is an agent.
          Even a thermostat is an agent &mdash; it senses temperature, decides if it&rsquo;s too
          cold or too hot, and turns the heater on or off.
        </p>
        <h3>The Agent Function</h3>
        <p>
          Formally, an <strong>agent function</strong> maps percept sequences to actions:
        </p>
        <pre><code>f : P* &rarr; A</code></pre>
        <p>
          where <code>P*</code> is the set of all possible percept sequences (the complete
          history of everything the agent has ever perceived) and <code>A</code> is the set
          of available actions. The <strong>agent program</strong> is the concrete
          implementation of this function &mdash; the actual code running on actual hardware.
        </p>

        <CalloutBox type="key-idea">
          <p>
            The <strong>function</strong> is the specification &mdash; what the perfect agent would do
            for every possible percept sequence. The <strong>program</strong> is the implementation &mdash;
            what we can actually build given finite memory, time, and computing power.
          </p>
        </CalloutBox>

        <QuizCard questions={QUIZ_S02} />
      </section>

      {/* Section 2.3: What Makes an Agent Rational? */}
      <section id="section-03" className="scroll-mt-6">
        <SectionHeader number="2.3" title="What Makes an Agent Rational?" />
        <p className="lead">
          Imagine you&rsquo;re playing poker. A rational player doesn&rsquo;t always win &mdash; but
          they always make the best bet given what they know.
        </p>
        <p>
          This is a crucial distinction. <strong>Rationality</strong> is not the same as
          omniscience (knowing everything), clairvoyance (seeing the future), or success
          (always winning). Rationality means doing the <em>best you can</em> with
          {' '}<em>what you know</em>.
        </p>
        <p>
          A <strong>rational agent</strong> selects actions that maximize its expected
          performance measure, given what it has perceived so far and any built-in knowledge
          it possesses. This is the gold standard we aim for when designing intelligent systems.
        </p>
        <h3>The Four Ingredients of Rationality</h3>
        <p>Four things determine what counts as rational behavior for a given agent:</p>
        <ol>
          <li><strong>Performance measure</strong> &mdash; How do we evaluate success? (e.g., amount of dirt cleaned, time taken)</li>
          <li><strong>Prior knowledge</strong> &mdash; What does the agent already know about the environment?</li>
          <li><strong>Possible actions</strong> &mdash; What can the agent actually do?</li>
          <li><strong>Percept sequence to date</strong> &mdash; What has the agent observed so far?</li>
        </ol>

        <CalloutBox type="warning">
          <p>
            Don&rsquo;t confuse rationality with perfection. A rational agent <em>can</em> fail &mdash;
            as long as it made the best decision possible with the information it had at the time.
            A poker player who goes all-in with pocket aces and loses to a lucky river card
            still made the rational choice.
          </p>
        </CalloutBox>

        <QuizCard questions={QUIZ_S03} />
      </section>

      {/* Section 2.4: Describing Agents — PEAS */}
      <section id="section-04" className="scroll-mt-6">
        <SectionHeader number="2.4" title="Describing Agents: PEAS" />
        <p className="lead">
          To design an agent, you need to specify four things: <strong>Performance measure</strong>,
          {' '}<strong>Environment</strong>, <strong>Actuators</strong>, and <strong>Sensors</strong>.
          This is the <strong>PEAS</strong> framework.
        </p>
        <p>
          Consider a self-driving taxi. Its <em>performance measure</em> includes safety,
          arrival time, legal compliance, and passenger comfort. Its <em>environment</em>
          {' '}consists of roads, traffic, weather, and pedestrians. Its <em>actuators</em> are the
          steering wheel, accelerator, brake, and signals. Its <em>sensors</em> include cameras,
          lidar, GPS, and a speedometer.
        </p>
        <p>
          PEAS is a checklist. Before you write a single line of code, you should be able to
          fill in all four boxes. If you can&rsquo;t, you don&rsquo;t yet understand the problem well enough.
        </p>
        <h3>PEAS Builder</h3>
        <p>Select a scenario and try to fill in the PEAS description, then check your answer.</p>

        <PEASBuilder />

        <QuizCard questions={QUIZ_S04} />
      </section>

      {/* Section 2.5: Types of Environments */}
      <section id="section-05" className="scroll-mt-6">
        <SectionHeader number="2.5" title="Types of Environments" />
        <p className="lead">
          Chess and poker are both games, but they create fundamentally different
          challenges for an AI agent. Understanding <em>why</em> requires classifying
          the environment.
        </p>
        <p>
          Every environment can be described along six dimensions. These properties determine
          how hard it is to build an agent that performs well:
        </p>
        <ul>
          <li><strong>Fully vs. partially observable</strong> &mdash; Can the agent see the entire state of the environment? Chess: yes. Poker: no (hidden cards).</li>
          <li><strong>Deterministic vs. stochastic</strong> &mdash; Does the next state follow deterministically from the current state and action? Chess: yes. Backgammon: no (dice rolls).</li>
          <li><strong>Episodic vs. sequential</strong> &mdash; Are decisions independent, or does each decision affect future ones? Image classification: episodic. Chess: sequential.</li>
          <li><strong>Static vs. dynamic</strong> &mdash; Does the environment change while the agent is deliberating? Chess (with clock): semi-dynamic. Traffic: dynamic.</li>
          <li><strong>Discrete vs. continuous</strong> &mdash; Is the state/action/time space finite or infinite? Chess: discrete. Driving: continuous.</li>
          <li><strong>Single-agent vs. multi-agent</strong> &mdash; Are there other agents whose actions affect the outcome? Puzzle: single. Poker: multi-agent.</li>
        </ul>

        <h3>Environment Classifier</h3>
        <p>For each scenario, classify the environment along all six properties. Then check your answers.</p>

        <EnvironmentClassifier />

        <CalloutBox type="key-idea">
          <p>
            The hardest environments are <strong>partially observable</strong>, <strong>stochastic</strong>,
            {' '}<strong>sequential</strong>, <strong>dynamic</strong>, <strong>continuous</strong>, and
            {' '}<strong>multi-agent</strong>. This is why self-driving cars are so hard &mdash; they face
            the worst-case combination of every dimension.
          </p>
        </CalloutBox>

        <QuizCard questions={QUIZ_S05} />
      </section>

      {/* Section 2.6: Agent Architectures */}
      <section id="section-06" className="scroll-mt-6">
        <SectionHeader number="2.6" title="Agent Architectures" />
        <p className="lead">
          There&rsquo;s a spectrum of agent designs, from dead-simple to deeply sophisticated.
          Each trades simplicity for capability.
        </p>
        <h3>1. Simple Reflex Agent</h3>
        <p>
          Acts based on the <em>current percept only</em>, using condition-action rules.
          &ldquo;If dirty, suck. If in A, move right.&rdquo; Fast and simple, but completely blind to history.
          It will keep bouncing between rooms even after both are clean.
        </p>
        <h3>2. Model-Based Reflex Agent</h3>
        <p>
          Maintains an <strong>internal model</strong> of the world that tracks things
          it can&rsquo;t currently see. &ldquo;I cleaned room A earlier, and I just cleaned room B,
          so both must be clean now &mdash; I can stop.&rdquo; This lets it handle
          {' '}<em>partially observable</em> environments.
        </p>
        <h3>3. Goal-Based Agent</h3>
        <p>
          Has an explicit <strong>goal</strong> (e.g., &ldquo;all rooms clean&rdquo;) and plans
          a sequence of actions to achieve it. This allows the agent to reason about
          the future and choose actions that lead toward the goal, not just react
          to the present.
        </p>
        <h3>4. Utility-Based Agent</h3>
        <p>
          Goes beyond binary goals. Uses a <strong>utility function</strong> to rank
          outcomes by desirability. &ldquo;Cleaning gains +100 utility, but moving costs -1.
          Both rooms are clean, so any movement would reduce my total utility &mdash;
          stay put.&rdquo; This lets the agent choose the <em>best</em> way to achieve its goals.
        </p>

        <h3>Vacuum World Simulation</h3>
        <p>
          Select an agent type, then use the controls to step through or play the simulation.
          Watch how different architectures handle the same two-room world.
        </p>

        <VacuumSimulationViz />

        <CalloutBox type="tip">
          <p>
            Simple reflex agents are fast but fragile. As you add memory (model-based), goals,
            and utility functions, agents become more capable but also more complex. There&rsquo;s
            always a trade-off. Try running each agent type above and compare their behavior
            &mdash; notice how the simple reflex agent keeps moving even after both rooms are clean,
            while the model-based agent knows to stop.
          </p>
        </CalloutBox>

        <QuizCard questions={QUIZ_S06} />

        <div className="not-prose mt-6">
          <Link to="/topic-03" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors no-underline">
            Next up: Solving problems by searching &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
