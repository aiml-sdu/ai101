import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppShell from './layouts/AppShell.tsx';

const WelcomePage = lazy(() => import('./pages/WelcomePage.tsx'));
const Topic01IntroPage = lazy(() => import('./pages/Topic01IntroPage.tsx'));
const Topic02AgentsPage = lazy(() => import('./pages/Topic02AgentsPage.tsx'));
const Topic03UninformedPage = lazy(() => import('./pages/Topic03UninformedPage.tsx'));
const Topic04InformedPage = lazy(() => import('./pages/Topic04InformedPage.tsx'));
const StubPage = lazy(() => import('./components/StubPage.tsx'));

const STUB_TOPICS = [
  { id: 'topic-05', number: 5, title: 'Local Search & Optimization', desc: 'Hill climbing, simulated annealing, genetic algorithms, and local beam search.' },
  { id: 'topic-06', number: 6, title: 'Constraint Satisfaction Problems', desc: 'Arc consistency, backtracking, forward checking, and constraint propagation.' },
  { id: 'topic-07', number: 7, title: 'Adversarial Search', desc: 'Minimax, alpha-beta pruning, and game-playing agents.' },
  { id: 'topic-08', number: 8, title: 'Logical Agents', desc: 'Propositional logic, inference, and knowledge-based agents.' },
  { id: 'topic-09', number: 9, title: 'Probability & Bayesian Networks', desc: 'Probabilistic reasoning, Bayes nets, and inference algorithms.' },
  { id: 'topic-10', number: 10, title: 'Machine Learning Fundamentals', desc: 'Supervised learning, decision trees, linear models, and evaluation.' },
  { id: 'topic-11', number: 11, title: 'Neural Networks', desc: 'Perceptrons, backpropagation, deep learning architectures.' },
  { id: 'topic-12', number: 12, title: 'Reinforcement Learning', desc: 'MDPs, Q-learning, policy gradients, and exploration strategies.' },
  { id: 'topic-13', number: 13, title: 'Clustering', desc: 'K-means, hierarchical clustering, and density-based methods.' },
];

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/welcome" replace /> },
      {
        path: 'welcome',
        element: (
          <Suspense fallback={null}>
            <WelcomePage />
          </Suspense>
        ),
      },
      {
        path: 'topic-01',
        element: (
          <Suspense fallback={null}>
            <Topic01IntroPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-02',
        element: (
          <Suspense fallback={null}>
            <Topic02AgentsPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-03',
        element: (
          <Suspense fallback={null}>
            <Topic03UninformedPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-04',
        element: (
          <Suspense fallback={null}>
            <Topic04InformedPage />
          </Suspense>
        ),
      },
      ...STUB_TOPICS.map((t) => ({
        path: t.id,
        element: (
          <Suspense fallback={null}>
            <StubPage number={t.number} title={t.title} description={t.desc} />
          </Suspense>
        ),
      })),
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
