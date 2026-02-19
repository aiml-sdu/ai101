import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface TopicCard {
  id: string;
  number: number;
  title: string;
  description: string;
  ready: boolean;
}

const TOPICS: TopicCard[] = [
  { id: 'topic-01', number: 1, title: 'Introduction to AI', description: 'What AI is, its history, and where it stands today', ready: true },
  { id: 'topic-02', number: 2, title: 'Intelligent Agents', description: 'How agents sense, think, and act in their environments', ready: true },
  { id: 'topic-03', number: 3, title: 'Solving Problems by Searching', description: 'BFS, DFS, and uniform-cost search on graph problems', ready: true },
  { id: 'topic-04', number: 4, title: 'Informed Search', description: 'Heuristics, greedy best-first, and A* search', ready: false },
  { id: 'topic-05', number: 5, title: 'Local Search & Optimization', description: 'Hill climbing, simulated annealing, and genetic algorithms', ready: false },
  { id: 'topic-06', number: 6, title: 'Constraint Satisfaction Problems', description: 'Modeling and solving CSPs with backtracking and arc consistency', ready: false },
  { id: 'topic-07', number: 7, title: 'Adversarial Search', description: 'Minimax, alpha-beta pruning, and game-playing agents', ready: false },
  { id: 'topic-08', number: 8, title: 'Logical Agents', description: 'Propositional logic, inference, and knowledge-based agents', ready: false },
  { id: 'topic-09', number: 9, title: 'Probability & Bayesian Networks', description: 'Reasoning under uncertainty with probabilistic models', ready: false },
  { id: 'topic-10', number: 10, title: 'Machine Learning Fundamentals', description: 'Supervised learning, decision trees, and model evaluation', ready: false },
  { id: 'topic-11', number: 11, title: 'Neural Networks', description: 'Perceptrons, backpropagation, and deep learning basics', ready: false },
  { id: 'topic-12', number: 12, title: 'Reinforcement Learning', description: 'Reward-driven agents, Q-learning, and exploration vs. exploitation', ready: false },
  { id: 'topic-13', number: 13, title: 'Clustering', description: 'Unsupervised learning, k-means, and hierarchical clustering', ready: false },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export default function WelcomePage() {
  const progress = useCourseProgress();

  // Overall stats across ready topics
  let totalVisited = 0;
  let totalSections = 0;
  for (const topic of TOPICS) {
    if (!topic.ready) continue;
    const tp = progress.get(topic.id);
    if (tp) {
      totalVisited += tp.visited;
      totalSections += tp.total;
    }
  }
  const overallPct = totalSections > 0 ? Math.round((totalVisited / totalSections) * 100) : 0;

  return (
    <div className="prose">
      <section className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">AI101</h1>
        <p className="text-xl text-muted-foreground mb-4">An Interactive Course in Artificial Intelligence</p>
        <p className="text-muted-foreground">
          A hands-on journey through the foundational ideas of AI, from search
          algorithms and logical reasoning to machine learning and neural networks.
          Each topic starts with a real-life scenario you already understand, then
          builds toward the formal concepts and algorithms that power modern AI systems.
        </p>
      </section>

      <section className="mb-10">
        <h2>How This Course Works</h2>
        <p>
          Every topic follows the same pattern: we begin with a concrete, everyday
          example&mdash;planning a road trip, playing a board game, diagnosing a
          problem&mdash;and use it to motivate the AI technique. Interactive
          visualizations let you experiment with the algorithms in real time, and
          quizzes check your understanding along the way.
        </p>
      </section>

      <section>
        <h2>Course Topics</h2>

        {totalVisited > 0 && (
          <div className="not-prose mb-6 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {totalVisited} of {totalSections} sections completed
              </span>
              <span className="text-sm text-muted-foreground">{overallPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 not-prose">
          {TOPICS.map((topic, i) => {
            const tp = topic.ready ? progress.get(topic.id) : undefined;
            const isComplete = tp && tp.pct === 100;

            const cardContent = (
              <Card className={`p-4 h-full flex flex-col transition-all ${topic.ready ? 'hover:shadow-md hover:border-primary/30 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary/60">{topic.number}</span>
                  <div className="flex items-center gap-1.5">
                    {!topic.ready && <Lock className="size-3.5 text-muted-foreground" />}
                    {isComplete ? (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="size-3 mr-1" /> Complete
                      </Badge>
                    ) : (
                      <Badge variant={topic.ready ? 'default' : 'secondary'}>
                        {topic.ready ? 'Ready' : 'Coming Soon'}
                      </Badge>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold mb-1 text-foreground">{topic.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{topic.description}</p>
                {tp && tp.visited > 0 && !isComplete && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{tp.visited}/{tp.total} sections</span>
                      <span className="text-xs text-muted-foreground">{tp.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${tp.pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );

            return (
              <motion.div
                key={topic.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                {topic.ready ? (
                  <Link to={`/${topic.id}`} className="no-underline">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
