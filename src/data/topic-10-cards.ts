import type { QuizQuestion } from '@/hooks/useQuizState';

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'why', label: '10.1 Introduction to ML', cardRange: [0, 7] },
  { id: 'regression', label: '10.2 Regression', cardRange: [8, 18] },
];

export interface LessonCardDef {
  id: string;
  title: string;
  sectionId: string;
  component: string;
  autoComplete?: boolean;
  requiresCompletion?: boolean;
}

export const CARDS: LessonCardDef[] = [
  { id: 'ml-definition-hook', title: 'When Rules Break', sectionId: 'why', component: 'MLDefinitionHook', requiresCompletion: true },
  { id: 'paradigm-playground', title: 'Paradigm Playground', sectionId: 'why', component: 'ParadigmPlayground', requiresCompletion: true },
  { id: 'reinforcement-loop-game', title: 'Rewards, States, Actions', sectionId: 'why', component: 'ReinforcementLoopGame', requiresCompletion: true },
  { id: 'supervised-model', title: 'What Is a Supervised Model?', sectionId: 'why', component: 'SupervisedModel', requiresCompletion: true },
  { id: 'output-type-arcade', title: 'Sort the Output Types', sectionId: 'why', component: 'OutputTypeArcade', requiresCompletion: true },
  { id: 'train-test-split', title: 'Train, Then Test', sectionId: 'why', component: 'TrainTestSplit', requiresCompletion: true },
  { id: 'deep-learning-domain-atlas', title: 'Deep Learning Across Domains', sectionId: 'why', component: 'DeepLearningDomainAtlas', requiresCompletion: true },
  { id: 'quiz-why', title: 'Quiz: Intro to ML', sectionId: 'why', component: 'QuizWhy', requiresCompletion: true },

  { id: 'price-guess-hook', title: 'Can You Guess the Price?', sectionId: 'regression', component: 'PriceGuessHook', requiresCompletion: true },
  { id: 'fit-the-line', title: 'Fit the Line', sectionId: 'regression', component: 'FitTheLine', requiresCompletion: true },
  { id: 'residual-squares', title: 'Residuals and Error', sectionId: 'regression', component: 'ResidualSquares', autoComplete: true },
  { id: 'regression-equation', title: 'The Regression Equation', sectionId: 'regression', component: 'RegressionEquation', autoComplete: true },
  { id: 'quiz-line', title: 'Quiz: Fitting a Line', sectionId: 'regression', component: 'QuizLine', requiresCompletion: true },
  { id: 'housing-dataset', title: 'The California Housing Data', sectionId: 'regression', component: 'HousingDataset', autoComplete: true },
  { id: 'multiple-regression', title: 'Multiple Regression', sectionId: 'regression', component: 'MultipleRegression', autoComplete: true },
  { id: 'quiz-multi', title: 'Quiz: Multiple Regression', sectionId: 'regression', component: 'QuizMulti', requiresCompletion: true },
  { id: 'fit-diagnosis', title: 'Underfit, Good Fit, Overfit', sectionId: 'regression', component: 'FitDiagnosis', requiresCompletion: true },
  { id: 'generalization-gap', title: 'What Generalizes?', sectionId: 'regression', component: 'GeneralizationGap', autoComplete: true },
  { id: 'quiz-fit-quality', title: 'Quiz: Fit Quality', sectionId: 'regression', component: 'QuizFitQuality', requiresCompletion: true },
];

export const QUIZ_101: QuizQuestion[] = [
  {
    id: 't10r-q01',
    question: 'Which lecture example is unsupervised learning?',
    options: [
      'Predicting house prices from labeled examples',
      'Grouping unlabeled examples into clusters',
      'Choosing chess moves from rewards',
      'Estimating test accuracy on unseen data',
    ],
    correctIndex: 1,
    explanation: 'Unsupervised learning works without labels. Clustering, outlier detection, generation, and filling missing data are the slide’s examples.',
  },
  {
    id: 't10r-q02',
    question: 'In supervised learning, each training example contains:',
    options: [
      'A state and a reward',
      'Only an input',
      'A paired input and target output',
      'Only a class label',
    ],
    correctIndex: 2,
    explanation: 'Supervised learning is about learning a mapping from paired input/output examples.',
  },
  {
    id: 't10r-q03',
    question: 'Which task is the clearest example of multiclass classification from the lecture?',
    options: [
      'Predicting a single house price',
      'Predicting sentiment as positive vs negative',
      'Assigning a music clip to one of several genres',
      'Predicting both house price and rent together',
    ],
    correctIndex: 2,
    explanation: 'Music genre classification has more than two discrete labels, so it is multiclass classification.',
  },
  {
    id: 't10r-q04',
    question: 'Which slide pairing is the best match for NLP / language?',
    options: [
      'Image classification with a convolutional network',
      'Text classification with a transformer network',
      'House price prediction with a fully connected network',
      'Image segmentation with a convolutional encoder-decoder',
    ],
    correctIndex: 1,
    explanation: 'The lecture explicitly pairs text classification with a transformer network, which sits under the NLP / language umbrella.',
  },
];

export const QUIZ_102: QuizQuestion[] = [
  {
    id: 't10r-q05',
    question: 'In the equation ŷ = wx + b, increasing w mainly changes the:',
    options: [
      'Steepness of the line',
      'Number of data points',
      'Meaning of the target variable',
      'Size of the test split',
    ],
    correctIndex: 0,
    explanation: 'The weight w is the slope. Bigger w means the prediction changes more quickly as x changes.',
  },
  {
    id: 't10r-q06',
    question: 'Why does MSE punish large mistakes more strongly than MAE?',
    options: [
      'It removes the residual sign before averaging',
      'It squares each residual before averaging',
      'It only looks at the training set',
      'It ignores small residuals completely',
    ],
    correctIndex: 1,
    explanation: 'Squaring the residual turns a big miss into a much larger contribution, which is why MSE reacts strongly to outliers.',
  },
];

export const QUIZ_103: QuizQuestion[] = [
  {
    id: 't10r-q07',
    question: 'If a multiple regression model uses 8 input features, how many learned parameters does it have including the bias?',
    options: ['8', '9', '16', '64'],
    correctIndex: 1,
    explanation: 'There is one weight per feature plus one bias term, so 8 features means 9 parameters total.',
  },
  {
    id: 't10r-q08',
    question: 'In the regression notebook, which single feature is the strongest standalone predictor of house value?',
    options: ['Population', 'AveRooms', 'MedInc', 'HouseAge'],
    correctIndex: 2,
    explanation: 'Median income (`MedInc`) is the strongest single-feature baseline in the notebook and has the clearest relationship with house value.',
  },
];

export const QUIZ_104: QuizQuestion[] = [
  {
    id: 't10r-q09',
    question: 'Which pattern is the clearest sign of overfitting?',
    options: [
      'Training and test error are both high',
      'Training error is low but test error is much worse',
      'Training and test error are both low',
      'The model uses only one feature',
    ],
    correctIndex: 1,
    explanation: 'Overfitting shows up when the model performs very well on training data but fails to generalize to new examples.',
  },
  {
    id: 't10r-q10',
    question: 'If a degree-1 model misses a curved pattern, the most likely problem is:',
    options: [
      'Overfitting',
      'Underfitting',
      'Data leakage',
      'Too many parameters',
    ],
    correctIndex: 1,
    explanation: 'A straight line can be too simple for a curved relationship. That is underfitting.',
  },
];
