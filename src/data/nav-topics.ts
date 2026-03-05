export interface NavSection {
  id: string;
  number: string;
  title: string;
}

export interface NavTopic {
  id: string;
  number: number;
  title: string;
  sections: NavSection[];
  locked?: boolean;
}

export const NAV_TOPICS: NavTopic[] = [
  {
    id: 'welcome',
    number: 0,
    title: 'Welcome',
    sections: [],
  },
  {
    id: 'topic-01',
    number: 1,
    title: 'Introduction to AI',
    sections: [
      { id: 'hook', number: '1.1', title: 'The AI Pattern' },
      { id: 'approaches', number: '1.2', title: 'Four Approaches' },
      { id: 'turing', number: '1.3', title: 'Turing & Critics' },
      { id: 'history', number: '1.4', title: 'AI History' },
      { id: 'today', number: '1.5', title: 'AI Today' },
      { id: 'lab', number: 'Lab', title: 'Lab 1a' },
    ],
  },
  {
    id: 'topic-02',
    number: 2,
    title: 'Intelligent Agents',
    sections: [
      { id: 'hook', number: '2.1', title: 'Introduction' },
      { id: 'design', number: '2.2', title: 'Rationality & Design' },
      { id: 'environments', number: '2.3', title: 'Environments' },
      { id: 'architectures', number: '2.4', title: 'Architectures' },
      { id: 'synthesis', number: '2.5', title: 'Synthesis' },
      { id: 'lab', number: 'Lab', title: 'Lab 1b' },
    ],
  },
  {
    id: 'topic-03',
    number: 3,
    title: 'Solving Problems by Searching',
    sections: [
      { id: 'challenge', number: '3.1', title: 'The Challenge' },
      { id: 'skeleton', number: '3.2', title: 'Search Skeleton' },
      { id: 'bfs', number: '3.3', title: 'BFS' },
      { id: 'dfs', number: '3.4', title: 'DFS & IDS' },
      { id: 'ucs', number: '3.5', title: 'UCS' },
      { id: 'bigpicture', number: '3.6', title: 'The Big Picture' },
      { id: 'lab', number: 'Lab', title: 'Lab 2' },
    ],
  },
  {
    id: 'topic-04',
    number: 4,
    title: 'Informed Search',
    sections: [
      { id: 'heuristics', number: '4.1', title: 'Heuristics' },
      { id: 'greedy', number: '4.2', title: 'Greedy Best-First' },
      { id: 'astar', number: '4.3', title: 'A* Search' },
      { id: 'admissibility', number: '4.4', title: 'Admissibility' },
      { id: 'design', number: '4.5', title: 'Heuristic Design' },
      { id: 'playground', number: '4.6', title: 'Playground' },
      { id: 'beyond', number: '4.7', title: 'Beyond A*' },
      { id: 'lab', number: 'Lab', title: 'Lab 3' },
    ],
  },
  {
    id: 'topic-05',
    number: 5,
    title: 'Local Search',
    locked: false,
    sections: [
      { id: 'motivation', number: '5.1', title: 'Beyond Search Trees' },
      { id: 'hill-climb', number: '5.2', title: 'Hill Climbing' },
      { id: 'sa', number: '5.3', title: 'Simulated Annealing' },
      { id: 'ga', number: '5.4', title: 'Genetic Algorithms' },
      { id: 'ga-practice', number: '5.5', title: 'GA in Practice' },
      { id: 'lab', number: 'Lab', title: 'Lab 4' },
    ],
  },
  {
    id: 'topic-06',
    number: 6,
    title: 'Adversarial Search',
    locked: true,
    sections: [],
  },
  {
    id: 'topic-07',
    number: 7,
    title: 'Constraint Satisfaction Problems',
    locked: true,
    sections: [],
  },
  {
    id: 'topic-08',
    number: 8,
    title: 'Probability & Bayesian Networks',
    locked: true,
    sections: [],
  },
  {
    id: 'topic-09',
    number: 9,
    title: 'Hidden Markov Models',
    locked: true,
    sections: [],
  },
  {
    id: 'topic-10',
    number: 10,
    title: 'Introduction to Machine Learning',
    locked: true,
    sections: [],
  },
  {
    id: 'topic-11',
    number: 11,
    title: 'ML Regression',
    locked: true,
    sections: [],
  },
  {
    id: 'topic-12',
    number: 12,
    title: 'ML Clustering & Review',
    locked: true,
    sections: [],
  },
];
