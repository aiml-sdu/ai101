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
      { id: 'section-01', number: '1.1', title: 'AI Is Already Everywhere' },
      { id: 'section-02', number: '1.2', title: 'What Does "Intelligent" Mean?' },
      { id: 'section-03', number: '1.3', title: 'The Turing Test' },
      { id: 'section-04', number: '1.4', title: 'A Brief History of AI' },
      { id: 'section-05', number: '1.5', title: 'Where AI Stands Today' },
      { id: 'section-06', number: '1.6', title: 'Summary & Key Takeaways' },
      { id: 'section-study', number: '1.7', title: 'Study & Review' },
      { id: 'section-lab', number: 'Lab', title: 'Lab 1a: Practice' },
    ],
  },
  {
    id: 'topic-02',
    number: 2,
    title: 'Intelligent Agents',
    sections: [
      { id: 'section-01', number: '2.1', title: 'The Robot Vacuum Problem' },
      { id: 'section-02', number: '2.2', title: 'Agents: Sense, Think, Act' },
      { id: 'section-03', number: '2.3', title: 'What Makes an Agent Rational?' },
      { id: 'section-04', number: '2.4', title: 'Describing Agents: PEAS' },
      { id: 'section-05', number: '2.5', title: 'Types of Environments' },
      { id: 'section-06', number: '2.6', title: 'Agent Architectures' },
      { id: 'section-study', number: '2.7', title: 'Study & Review' },
      { id: 'section-lab', number: 'Lab', title: 'Lab 1b: Practice' },
    ],
  },
  {
    id: 'topic-03',
    number: 3,
    title: 'Solving Problems by Searching',
    sections: [
      { id: 'section-01', number: '3.1', title: 'Planning a Road Trip' },
      { id: 'section-02', number: '3.2', title: 'Framing Problems as Search' },
      { id: 'section-03', number: '3.3', title: 'The Tree Search Algorithm' },
      { id: 'section-04', number: '3.4', title: 'Breadth-First Search' },
      { id: 'section-05', number: '3.5', title: 'Depth-First Search' },
      { id: 'section-06', number: '3.6', title: 'Uniform-Cost Search' },
      { id: 'section-07', number: '3.7', title: 'Comparing Strategies' },
      { id: 'section-study', number: '3.8', title: 'Study & Review' },
      { id: 'section-lab', number: 'Lab', title: 'Lab 2: Practice' },
    ],
  },
  {
    id: 'topic-04',
    number: 4,
    title: 'Informed Search',
    locked: true,
    sections: [
      { id: 'section-01', number: '4.1', title: 'What If You Had a Compass?' },
      { id: 'section-02', number: '4.2', title: 'Greedy Best-First Search' },
      { id: 'section-03', number: '4.3', title: 'A* Search' },
      { id: 'section-04', number: '4.4', title: 'Why A* Works: Admissibility' },
      { id: 'section-05', number: '4.5', title: 'Designing Heuristics' },
      { id: 'section-06', number: '4.6', title: 'The Pathfinding Playground' },
      { id: 'section-07', number: '4.7', title: 'Beyond A*: Weighted Search & Variants' },
    ],
  },
  { id: 'topic-05', number: 5, title: 'Local Search & Optimization', locked: true, sections: [] },
  { id: 'topic-06', number: 6, title: 'Constraint Satisfaction Problems', locked: true, sections: [] },
  { id: 'topic-07', number: 7, title: 'Adversarial Search', locked: true, sections: [] },
  { id: 'topic-08', number: 8, title: 'Logical Agents', locked: true, sections: [] },
  { id: 'topic-09', number: 9, title: 'Probability & Bayesian Networks', locked: true, sections: [] },
  { id: 'topic-10', number: 10, title: 'Machine Learning Fundamentals', locked: true, sections: [] },
  { id: 'topic-11', number: 11, title: 'Neural Networks', locked: true, sections: [] },
  { id: 'topic-12', number: 12, title: 'Reinforcement Learning', locked: true, sections: [] },
  { id: 'topic-13', number: 13, title: 'Clustering', locked: true, sections: [] },
];
