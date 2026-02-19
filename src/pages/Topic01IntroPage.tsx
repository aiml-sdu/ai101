import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.tsx';
import QuizCard, { type QuizQuestion } from '../components/QuizCard.tsx';
import CalloutBox from '../components/CalloutBox.tsx';
import ConceptReveal, { type ConceptCard } from '../components/ConceptReveal.tsx';
import TldrBox from '../components/TldrBox.tsx';
import FlashcardDeck from '../components/FlashcardDeck.tsx';
import ClozeText from '../components/ClozeText.tsx';
import { TOPIC_01_FLASHCARDS, TOPIC_01_CLOZE } from '../data/study/topic-01-study.ts';
import TierDivider from '../components/TierDivider.tsx';
import HookQuestion from '../components/HookQuestion.tsx';
import LabProgressBar from '../components/LabProgressBar.tsx';
import Exercise1ClassifyApproach from './visualizations/lab/Exercise1ClassifyApproach.tsx';
import Exercise2TimelineOrder from './visualizations/lab/Exercise2TimelineOrder.tsx';
import Exercise3TuringJudge from './visualizations/lab/Exercise3TuringJudge.tsx';

const ApproachesMatrixViz = lazy(() => import('./visualizations/ApproachesMatrixViz.tsx'));
const ChineseRoomViz = lazy(() => import('./visualizations/ChineseRoomViz.tsx'));
const AITimelineViz = lazy(() => import('./visualizations/AITimelineViz.tsx'));
const SpotTheIntelligenceGame = lazy(() => import('./visualizations/SpotTheIntelligenceGame.tsx'));
const SenseDecideActViz = lazy(() => import('./visualizations/SenseDecideActViz.tsx'));
const CapabilitySpectrumViz = lazy(() => import('./visualizations/CapabilitySpectrumViz.tsx'));
const AIHypeCycleViz = lazy(() => import('./visualizations/AIHypeCycleViz.tsx'));

const CONCEPT_CARDS: ConceptCard[] = [
  {
    title: 'Thinking Humanly',
    brief: 'Cognitive modeling approach',
    detail: 'Build systems that think the way humans think. Uses cognitive science and experimental psychology to model human reasoning. Example: GPS (General Problem Solver) tried to match human problem-solving steps.',
    icon: '\u{1F9E0}',
  },
  {
    title: 'Thinking Rationally',
    brief: 'Laws of thought approach',
    detail: 'Build systems that think logically and correctly. Uses formal logic to represent knowledge and derive conclusions. Example: Expert systems using if-then rules. Challenge: not all intelligence is logical reasoning.',
    icon: '\u{1F4D0}',
  },
  {
    title: 'Acting Humanly',
    brief: 'The Turing Test approach',
    detail: "Build systems that act indistinguishably from humans. Alan Turing proposed: if a machine can fool a human evaluator, it's intelligent. Requires NLP, knowledge representation, reasoning, and learning.",
    icon: '\u{1F3AD}',
  },
  {
    title: 'Acting Rationally',
    brief: 'The rational agent approach',
    detail: 'Build systems that act to achieve the best expected outcome. This is the dominant approach in modern AI. An agent perceives and acts; a rational agent does so optimally. This is what this course focuses on.',
    icon: '\u{1F3AF}',
  },
];

const QUIZ_S1: QuizQuestion[] = [
  {
    id: 't01-s01-q1',
    question: 'Which of the following is an example of AI you likely interact with daily?',
    options: ['A mechanical calculator', 'A light switch', 'A spam filter in your email', 'A wall clock'],
    correctIndex: 2,
    explanation: 'A spam filter uses machine learning to classify incoming emails as spam or not spam. It perceives data (email content) and makes decisions — the core pattern of AI. Calculators, light switches, and clocks are mechanical/electrical devices with no learning or decision-making.',
  },
  {
    id: 't01-s01-q2',
    question: 'What do AI systems like voice assistants, recommendation engines, and fraud detectors have in common?',
    options: ['They all use neural networks', 'They all take in information and make decisions', 'They all require an internet connection', 'They all understand human language'],
    correctIndex: 1,
    explanation: 'At their core, all AI systems share the same pattern: they perceive some aspect of the world (take in information) and act on it (make decisions). The specific techniques (neural networks, rules, etc.) vary widely.',
  },
];

const QUIZ_S2: QuizQuestion[] = [
  {
    id: 't01-q1',
    question: 'A chess engine that uses brute-force search to find the optimal move is best described as:',
    options: ['Thinking humanly', 'Thinking rationally', 'Acting humanly', 'Acting rationally'],
    correctIndex: 3,
    explanation: 'The chess engine acts to achieve the best outcome (winning) without necessarily mimicking human thought processes. This makes it an example of acting rationally.',
  },
  {
    id: 't01-q2',
    question: 'A chatbot designed to pass the Turing Test would need all of the following EXCEPT:',
    options: ['Natural language processing', 'The ability to feel emotions', 'Knowledge representation', 'Machine learning'],
    correctIndex: 1,
    explanation: "The Turing Test requires NLP, knowledge representation, reasoning, and learning. It does NOT require actually feeling emotions \u2014 only convincing a human that it might.",
  },
  {
    id: 't01-q3',
    question: 'Which approach to AI does this course primarily follow?',
    options: ['Thinking humanly', 'Thinking rationally', 'Acting humanly', 'Acting rationally'],
    correctIndex: 3,
    explanation: 'This course follows the rational agent approach \u2014 building agents that perceive their environment and act to maximize their performance measure.',
  },
];

const QUIZ_S3: QuizQuestion[] = [
  {
    id: 't01-q4',
    question: 'Which capability is required for the Total Turing Test but NOT the standard Turing Test?',
    options: ['Natural language processing', 'Computer vision', 'Knowledge representation', 'Automated reasoning'],
    correctIndex: 1,
    explanation: 'The Total Turing Test extends the standard test by requiring computer vision (to perceive objects) and robotics (to manipulate them). The standard test only requires NLP, knowledge representation, reasoning, and learning.',
  },
  {
    id: 't01-q5',
    question: 'The Chinese Room argument challenges the Turing Test by suggesting that:',
    options: ['Machines can never pass the test', "Passing the test doesn't prove understanding", 'The test is too easy for modern AI', 'Only humans can be truly intelligent'],
    correctIndex: 1,
    explanation: "Searle's Chinese Room argues that symbol manipulation (following rules) can produce correct outputs without any understanding of meaning. A system could pass the Turing Test while having zero comprehension.",
  },
];

const QUIZ_S4: QuizQuestion[] = [
  {
    id: 't01-s04-q1',
    question: 'The Dartmouth Conference of 1956 is significant because it:',
    options: ['Invented the first neural network', 'Formally established AI as a field and coined the term', 'Demonstrated the first chatbot', 'Created the first AI winter'],
    correctIndex: 1,
    explanation: 'The 1956 Dartmouth Conference, organized by McCarthy, Minsky, Shannon, and Rochester, is where "artificial intelligence" was coined as a term and AI was established as a formal research discipline.',
  },
  {
    id: 't01-s04-q2',
    question: 'Which event is widely credited with launching the modern deep learning era?',
    options: ['Deep Blue defeating Kasparov in 1997', 'AlexNet winning ImageNet in 2012', 'Watson winning Jeopardy! in 2011', 'The creation of ELIZA in 1966'],
    correctIndex: 1,
    explanation: 'AlexNet\'s dominant victory in the 2012 ImageNet competition demonstrated the power of deep convolutional neural networks and is widely considered the catalyst for the modern deep learning revolution.',
  },
];

const QUIZ_S5: QuizQuestion[] = [
  {
    id: 't01-q6',
    question: 'Which of the following is an example of narrow AI?',
    options: ['A system that can do anything a human can', 'A chess engine that plays at superhuman level', 'A robot with common sense reasoning', 'An AI that understands any language, task, or domain'],
    correctIndex: 1,
    explanation: "A chess engine excels at one specific task (chess) but can't do anything else. This is narrow AI. The other options describe aspects of general AI, which doesn't exist yet.",
  },
  {
    id: 't01-q7',
    question: 'AI winters were primarily caused by:',
    options: ['Hardware becoming too expensive', 'The gap between promises and actual capabilities', 'Governments banning AI research', 'Scientists losing interest in the field'],
    correctIndex: 1,
    explanation: 'AI winters occurred when the field overpromised and underdelivered. Researchers claimed breakthroughs were imminent, but real-world problems proved far harder than toy examples.',
  },
];

export default function Topic01IntroPage() {
  return (
    <div className="prose">
      <h1>Topic 1: Introduction to AI</h1>
      <p className="lead">
        What is artificial intelligence, really? Before we write a single algorithm,
        we need to understand what we mean by &ldquo;intelligence&rdquo;&mdash;and why
        even the experts can&rsquo;t fully agree on a definition. This topic sets the
        stage for everything that follows.
      </p>

      <HookQuestion
        question="What makes something intelligent — and could a machine ever truly be?"
        subtext="Before we can build intelligent systems, we need to wrestle with what 'intelligent' even means."
      />

      <TldrBox items={[
        'Four approaches to AI: thinking/acting humanly vs. thinking/acting rationally',
        'The Turing Test measures human-like behavior; the rational agent approach optimizes outcomes',
        'AI history: early optimism, knowledge-based era, statistical revolution, deep learning boom',
        'Modern AI focuses on building rational agents that perceive, reason, and act optimally',
      ]} />

      {/* ── First Principles ── */}
      <TierDivider tier="first-principles" />
      <section id="section-first-principles" className="scroll-mt-6">
        <SectionHeader number="1.1" title="First Principles" />

        <p>
          You unlocked your phone with your face this morning. Your email sorted itself.
          A chatbot helped you track a package. You&rsquo;re surrounded by AI and barely
          notice.
        </p>
        <p>
          These aren&rsquo;t science-fiction scenarios&mdash;they&rsquo;re Tuesday. AI is
          already woven into the fabric of daily life, quietly handling tasks that would
          have seemed magical a generation ago. Voice assistants answer your questions,
          recommendation engines choose your next show, and fraud-detection systems guard
          your bank account&mdash;all without you lifting a finger.
        </p>
        <h3>What Do These Systems Have in Common?</h3>
        <p>
          Strip away the buzzwords and you find a simple pattern: each system
          <strong> takes in information</strong> and <strong>makes decisions</strong>.
          Some learn from data, some follow hand-crafted rules, and some do both. But at
          their core, they all perceive some aspect of the world and act on it.
        </p>

        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
          <SenseDecideActViz />
        </Suspense>

        <blockquote>
          <p>
            We call these systems <em>artificially intelligent</em>&mdash;but what does
            that actually mean? Turns out, even researchers can&rsquo;t fully agree.
          </p>
        </blockquote>

        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
          <SpotTheIntelligenceGame />
        </Suspense>

        <h3>The Four Approaches to AI</h3>
        <p>
          A calculator does math faster than you. Is it intelligent? A dog learns tricks.
          Is <em>it</em> intelligent? Where&rsquo;s the line?
        </p>
        <p>
          Intelligence isn&rsquo;t one thing. Depending on who you ask, it might mean
          <strong> thinking like a human</strong>, <strong>thinking logically</strong>,
          <strong> acting like a human</strong>, or <strong>acting optimally</strong>.
          Each of these leads to a fundamentally different approach to building AI.
        </p>
        <blockquote>
          <p>
            These four combinations give us the four approaches to AI&mdash;a 2&times;2
            matrix that has organized the entire field since the beginning.
          </p>
        </blockquote>
        <p>
          Russell &amp; Norvig&rsquo;s classic textbook frames AI along two dimensions:
          <strong> thinking vs. acting</strong> and <strong>humanly vs. rationally</strong>.
          This gives us four quadrants:
        </p>
        <table>
          <thead>
            <tr><th></th><th>Humanly</th><th>Rationally</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Thinking</strong></td><td>Cognitive modeling</td><td>Laws of thought</td></tr>
            <tr><td><strong>Acting</strong></td><td>Turing Test</td><td>Rational agents</td></tr>
          </tbody>
        </table>
        <Suspense fallback={null}>
          <ApproachesMatrixViz />
        </Suspense>
        <p>Click each card below to explore the four approaches in detail:</p>
        <ConceptReveal cards={CONCEPT_CARDS} />
      </section>

      {/* ── Feynman / Intuitive Explanation ── */}
      <TierDivider tier="feynman" />
      <section id="section-feynman" className="scroll-mt-6">
        <SectionHeader number="1.2" title="Intuitive Explanation" />

        <h3>The Turing Test</h3>
        <p>
          Have you ever talked to a chatbot and wasn&rsquo;t sure if it was human? That
          uncanny moment&mdash;hovering between <em>&ldquo;this is clearly a machine&rdquo;</em>
          {' '}and <em>&ldquo;wait, maybe not&rdquo;</em>&mdash;is exactly what Alan Turing was
          thinking about in 1950.
        </p>
        <h4>The Imitation Game</h4>
        <p>
          Turing proposed a practical test: place a human evaluator in one room and a
          machine in another. They communicate only through text. If the evaluator
          can&rsquo;t reliably tell which is the machine, does that count as intelligence?
        </p>
        <p>To pass, a machine would need an impressive suite of capabilities:</p>
        <ul>
          <li><strong>Natural language processing</strong>&mdash;to understand and generate human language</li>
          <li><strong>Knowledge representation</strong>&mdash;to store what it knows about the world</li>
          <li><strong>Automated reasoning</strong>&mdash;to draw conclusions from its knowledge</li>
          <li><strong>Machine learning</strong>&mdash;to adapt to new situations and detect patterns</li>
        </ul>
        <CalloutBox type="key-idea">
          <p>The Turing Test is about behavior, not internal mechanisms. A machine doesn't need to think like a human &mdash; it just needs to act indistinguishably from one.</p>
        </CalloutBox>

        <h4>The Chinese Room</h4>
        <p>
          Not everyone buys the Turing Test as proof of intelligence. Philosopher
          <strong> John Searle</strong> proposed a famous thought experiment: imagine a
          person locked in a room, following a rulebook to manipulate Chinese symbols.
          They receive Chinese questions, look up the right symbols, and slide back
          Chinese answers. To an outside observer, the room &ldquo;speaks&rdquo; Chinese
          perfectly&mdash;but the person inside understands <em>nothing</em>.
        </p>
        <p>
          Searle&rsquo;s point: symbol manipulation can produce correct outputs without
          any understanding. Passing the Turing Test doesn&rsquo;t necessarily mean a
          system <em>comprehends</em> anything. This remains one of the deepest debates
          in AI philosophy.
        </p>
        <Suspense fallback={null}>
          <ChineseRoomViz />
        </Suspense>
      </section>

      {/* ── Advanced / Technical ── */}
      <TierDivider tier="advanced" />
      <section id="section-advanced" className="scroll-mt-6">
        <SectionHeader number="1.3" title="Advanced / Technical" />

        <h3>The Total Turing Test</h3>
        <p>
          The standard test only involves text conversation. The <strong>Total Turing
          Test</strong> raises the bar by adding:
        </p>
        <ul>
          <li><strong>Computer vision</strong>&mdash;to perceive objects in the physical world</li>
          <li><strong>Robotics</strong>&mdash;to manipulate objects and navigate the environment</li>
        </ul>

        <h3>A Brief History of AI</h3>
        <p>
          AI isn&rsquo;t new&mdash;researchers have been chasing this dream since the 1950s.
          And it hasn&rsquo;t been a straight line. The field swings between wild optimism
          and crushing disappointment (&ldquo;AI winters&rdquo;). Understanding the history
          explains why.
        </p>
        <h4>Key Milestones</h4>
        <Suspense fallback={null}>
          <AITimelineViz />
        </Suspense>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
          <AIHypeCycleViz />
        </Suspense>
        <div className="relative ml-4 border-l-2 border-border pl-6 space-y-6" role="list" aria-label="AI history timeline">
          {[
            { year: '1943', content: <><strong>McCulloch &amp; Pitts</strong>&mdash;First mathematical model of a neuron, laying the groundwork for neural networks.</> },
            { year: '1950', content: <><strong>Turing&rsquo;s Paper</strong>&mdash;&ldquo;Computing Machinery and Intelligence&rdquo; poses the question: Can machines think?</> },
            { year: '1956', content: <><strong>Dartmouth Conference</strong>&mdash;AI is born as a formal field. McCarthy, Minsky, Shannon, and Rochester coin the term &ldquo;artificial intelligence.&rdquo;</> },
            { year: '1966', content: <><strong>ELIZA</strong>&mdash;Weizenbaum&rsquo;s chatbot becomes the first program to hold a (superficial) conversation with humans.</> },
            { year: '1969', content: <><strong>Shakey the Robot</strong>&mdash;The first general-purpose mobile robot that could reason about its own actions.</> },
            { year: '1970s', content: <><strong>First AI Winter</strong>&mdash;Funding dries up after researchers overpromise and underdeliver. The gap between toy problems and reality proves vast.</> },
            { year: '1980s', content: <><strong>Expert Systems Boom &amp; Bust</strong>&mdash;Rule-based systems find commercial success, then collapse under maintenance costs and brittleness. The second AI winter follows.</> },
            { year: '1997', content: <><strong>Deep Blue vs. Kasparov</strong>&mdash;IBM&rsquo;s chess engine defeats the reigning world champion, stunning the world.</> },
            { year: '2011', content: <><strong>Watson wins Jeopardy!</strong>&mdash;IBM&rsquo;s question-answering system beats human champions at a game requiring natural language understanding.</> },
            { year: '2012', content: <><strong>AlexNet &amp; Deep Learning</strong>&mdash;A deep convolutional neural network crushes the ImageNet competition, igniting the modern deep learning era.</> },
            { year: '2016', content: <><strong>AlphaGo vs. Lee Sedol</strong>&mdash;DeepMind&rsquo;s system defeats a world Go champion, a feat many thought was decades away.</> },
            { year: '2020s', content: <><strong>Large Language Models</strong>&mdash;GPT, Claude, and other LLMs transform NLP, enabling general-purpose text generation, reasoning, and conversation at an unprecedented scale.</> },
          ].map((item) => (
            <div key={item.year} className="relative" role="listitem">
              <div className="absolute -left-[calc(1.5rem+1px)] top-1.5 size-2 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />
              <div className="font-semibold text-sm text-primary font-mono">{item.year}</div>
              <div className="text-sm mt-0.5">{item.content}</div>
            </div>
          ))}
        </div>
        <CalloutBox type="info">
          <p>AI winters happened because researchers promised more than they could deliver. The gap between solving toy problems and real-world problems was vastly underestimated.</p>
        </CalloutBox>

        <h3>Where AI Stands Today</h3>
        <p>
          Today&rsquo;s AI systems are astonishingly capable in specific domains. They can
          diagnose diseases from medical scans, drive cars on highways, translate between
          hundreds of languages, generate photorealistic images from text descriptions, and
          write code that passes professional-level interviews.
        </p>
        <h4>What AI Can Do Now — and What Remains Hard</h4>

        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
          <CapabilitySpectrumViz />
        </Suspense>
        <CalloutBox type="key-idea">
          <p>Today's AI is narrow &mdash; it excels at specific tasks but lacks the general intelligence humans have. AGI (Artificial General Intelligence) remains an open challenge.</p>
        </CalloutBox>

        <h3>Summary &amp; Key Takeaways</h3>
        <p>Let&rsquo;s recap what we&rsquo;ve covered in this introduction:</p>
        <h4>The Four Approaches to AI</h4>
        <p>
          AI can be framed along two axes&mdash;<strong>thinking vs. acting</strong> and
          <strong> humanly vs. rationally</strong>. This gives us four approaches: cognitive
          modeling (thinking humanly), logic-based reasoning (thinking rationally), the
          Turing Test (acting humanly), and rational agents (acting rationally).
        </p>
        <h4>The Turing Test</h4>
        <p>
          Turing proposed a behavioral test for intelligence: if a machine can fool a human
          evaluator in conversation, it passes. The test requires NLP, knowledge
          representation, reasoning, and learning. The Chinese Room argument challenges
          whether passing implies true understanding.
        </p>
        <h4>The Rational Agent Approach</h4>
        <p>
          This course follows the <strong>rational agent</strong> paradigm. An agent
          perceives its environment through sensors and acts through actuators. A
          <em> rational</em> agent acts to maximize its expected performance measure.
          Every algorithm we study&mdash;from search to machine learning&mdash;is a tool
          for building better rational agents.
        </p>
        <CalloutBox type="tip">
          <p>This course follows the rational agent approach. An agent perceives its environment and acts to maximize its performance measure. Everything we study &mdash; from search algorithms to machine learning &mdash; serves this goal.</p>
        </CalloutBox>
        <div className="not-prose mt-6">
          <Link to="/topic-02" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors no-underline">
            Next up: What exactly is an agent? &rarr;
          </Link>
        </div>
      </section>

      {/* ── Check Your Understanding (MCQ) ── */}
      <TierDivider tier="quiz" />
      <section id="section-quiz" className="scroll-mt-6">
        <SectionHeader number="1.4" title="Check Your Understanding" />
        <h3>AI in Daily Life &amp; Approaches</h3>
        <QuizCard questions={[...QUIZ_S1, ...QUIZ_S2]} />
        <h3>The Turing Test</h3>
        <QuizCard questions={QUIZ_S3} />
        <h3>History &amp; Current State</h3>
        <QuizCard questions={[...QUIZ_S4, ...QUIZ_S5]} />
      </section>

      {/* ── Fill in the Blanks (Cloze) ── */}
      <TierDivider tier="cloze" />
      <section id="section-cloze" className="scroll-mt-6">
        <SectionHeader number="1.5" title="Fill in the Blanks" />
        <p>Test your recall by filling in the missing terms.</p>
        <div className="not-prose">
          {TOPIC_01_CLOZE.map((ex) => <ClozeText key={ex.id} exercise={ex} />)}
        </div>
      </section>

      {/* ── Lab Exercises ── */}
      <TierDivider tier="lab" label="Lab 1a: Practice" />
      <section id="section-lab" className="scroll-mt-6">
        <LabProgressBar
          exercises={[
            { id: 'lab-t01-ex1', steps: 3, label: 'Exercise 1' },
            { id: 'lab-t01-ex2', steps: 3, label: 'Exercise 2' },
            { id: 'lab-t01-ex3', steps: 3, label: 'Exercise 3' },
          ]}
        />
        <Exercise1ClassifyApproach />
        <Exercise2TimelineOrder />
        <Exercise3TuringJudge />
      </section>

      {/* ── Extra Exercises ── */}
      <TierDivider tier="extra" />
      <section id="section-extra" className="scroll-mt-6">
        <SectionHeader number="1.6" title="Extra Exercises" />
        <p>Review key concepts with flashcards for spaced repetition.</p>
        <div className="not-prose">
          <FlashcardDeck cards={TOPIC_01_FLASHCARDS} topicId="topic-01" compact />
        </div>
      </section>
    </div>
  );
}
