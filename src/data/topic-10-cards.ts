import type { QuizQuestion } from '@/hooks/useQuizState';

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'why', label: 'Introduction to ML', cardRange: [0, 3] },
  { id: 'basics', label: 'What Counts as Regression', cardRange: [4, 7] },
  { id: 'line', label: 'Fit a Line', cardRange: [8, 11] },
  { id: 'multi', label: 'More Than One Feature', cardRange: [12, 14] },
  { id: 'fit-quality', label: 'When Fits Go Wrong', cardRange: [15, 17] },
  { id: 'lab', label: 'Lab 1', cardRange: [18, 20] },
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
  { id: 'paradigm-playground', title: 'Paradigm Playground', sectionId: 'why', component: 'ParadigmPlayground', requiresCompletion: true },
  { id: 'supervised-model', title: 'What Is a Supervised Model?', sectionId: 'why', component: 'SupervisedModel', requiresCompletion: true },
  { id: 'task-gallery', title: 'ML Tasks Across Domains', sectionId: 'why', component: 'TaskGallery', requiresCompletion: true },
  { id: 'quiz-why', title: 'Quiz: Intro to ML', sectionId: 'why', component: 'QuizWhy', requiresCompletion: true },

  { id: 'price-guess-hook', title: 'Can You Guess the Price?', sectionId: 'basics', component: 'PriceGuessHook', requiresCompletion: true },
  { id: 'regression-terms', title: 'Continuous, Discrete, Uni, Multi', sectionId: 'basics', component: 'RegressionTerms', autoComplete: true },
  { id: 'train-test-split', title: 'Train vs Test', sectionId: 'basics', component: 'TrainTestSplit', requiresCompletion: true },
  { id: 'quiz-basics', title: 'Quiz: Regression Basics', sectionId: 'basics', component: 'QuizBasics', requiresCompletion: true },

  { id: 'fit-the-line', title: 'Fit the Line', sectionId: 'line', component: 'FitTheLine', requiresCompletion: true },
  { id: 'residual-squares', title: 'Residuals and Error', sectionId: 'line', component: 'ResidualSquares', autoComplete: true },
  { id: 'regression-equation', title: 'The Regression Equation', sectionId: 'line', component: 'RegressionEquation', autoComplete: true },
  { id: 'quiz-line', title: 'Quiz: Fitting a Line', sectionId: 'line', component: 'QuizLine', requiresCompletion: true },

  { id: 'housing-dataset', title: 'The California Housing Data', sectionId: 'multi', component: 'HousingDataset', autoComplete: true },
  { id: 'multiple-regression', title: 'Multiple Regression', sectionId: 'multi', component: 'MultipleRegression', autoComplete: true },
  { id: 'quiz-multi', title: 'Quiz: Multiple Regression', sectionId: 'multi', component: 'QuizMulti', requiresCompletion: true },

  { id: 'fit-diagnosis', title: 'Underfit, Good Fit, Overfit', sectionId: 'fit-quality', component: 'FitDiagnosis', requiresCompletion: true },
  { id: 'generalization-gap', title: 'What Generalizes?', sectionId: 'fit-quality', component: 'GeneralizationGap', autoComplete: true },
  { id: 'quiz-fit-quality', title: 'Quiz: Fit Quality', sectionId: 'fit-quality', component: 'QuizFitQuality', requiresCompletion: true },

  { id: 'lab10-ex1', title: 'Exercise 1: Explore the Housing Data', sectionId: 'lab', component: 'Lab10Ex1', requiresCompletion: true },
  { id: 'lab10-ex2', title: 'Exercise 2: Simple vs Multiple Regression', sectionId: 'lab', component: 'Lab10Ex2', requiresCompletion: true },
  { id: 'lab10-ex3', title: 'Exercise 3: Diagnose the Fit', sectionId: 'lab', component: 'Lab10Ex3', requiresCompletion: true },
];

export const QUIZ_101: QuizQuestion[] = [
  {
    id: 't10r-q01',
    question: 'Which lecture example is reinforcement learning?',
    options: [
      'Clustering an unlabeled dataset',
      'Predicting house price from labeled examples',
      'Learning to play chess from rewards while exploring moves',
      'Filling in missing values in a dataset',
    ],
    correctIndex: 2,
    explanation: 'Reinforcement learning uses states, actions, and rewards. The lecture’s chess example fits that setup exactly.',
  },
  {
    id: 't10r-q02',
    question: 'In supervised learning, each training example contains:',
    options: [
      'Only an input',
      'Only an output',
      'A paired input and target output',
      'A reward and an action',
    ],
    correctIndex: 2,
    explanation: 'Supervised learning uses paired input/output examples. For regression, the output is usually a continuous value such as price, temperature, or demand.',
  },
  {
    id: 't10r-q03',
    question: 'Predicting both house price and monthly rent from the same feature vector is best described as:',
    options: [
      'Binary classification',
      'Multiclass classification',
      'Univariate regression',
      'Multivariate regression',
    ],
    correctIndex: 3,
    explanation: 'Regression predicts continuous numbers. If the model predicts more than one numeric output at once, it becomes multivariate regression.',
  },
];

export const QUIZ_102: QuizQuestion[] = [
  {
    id: 't10r-q04',
    question: 'Which of these is a regression task?',
    options: [
      'Predict whether an email is spam',
      'Predict the selling price of a house',
      'Label a music clip by genre',
      'Choose the species of a penguin',
    ],
    correctIndex: 1,
    explanation: 'Regression predicts a continuous number. House price is continuous, while spam labels, music genres, and species are discrete classes.',
  },
  {
    id: 't10r-q05',
    question: 'What does "multivariate output" mean?',
    options: [
      'The model uses many input features',
      'The model predicts more than one output value',
      'The dataset has many rows',
      'The model can only predict classes',
    ],
    correctIndex: 1,
    explanation: 'Univariate means one output. Multivariate means the model produces multiple outputs, even if the input also contains many features.',
  },
];

export const QUIZ_103: QuizQuestion[] = [
  {
    id: 't10r-q06',
    question: 'In the equation ŷ = wx + b, increasing w mainly changes the:',
    options: [
      'Steepness of the line',
      'Number of data points',
      'Meaning of the target variable',
      'Size of the test set',
    ],
    correctIndex: 0,
    explanation: 'The weight w is the slope. A larger positive slope makes the line steeper, while b shifts the whole line up or down.',
  },
  {
    id: 't10r-q07',
    question: 'Why do we keep a separate test set?',
    options: [
      'To make the scatter plot look cleaner',
      'To estimate how well the model works on unseen data',
      'To reduce the number of features',
      'To avoid fitting a line altogether',
    ],
    correctIndex: 1,
    explanation: 'The test set is held out so we can check generalization. A model that only looks good on training data may have memorized noise instead of learning a useful pattern.',
  },
];

export const QUIZ_104: QuizQuestion[] = [
  {
    id: 't10r-q08',
    question: 'If a multiple regression model uses 8 input features, how many learned parameters does it have including the bias?',
    options: ['8', '9', '16', '64'],
    correctIndex: 1,
    explanation: 'There is one weight for each input feature plus one bias term. With 8 features that gives 8 weights + 1 bias = 9 parameters.',
  },
  {
    id: 't10r-q09',
    question: 'In the regression notebook, which single feature is the strongest standalone predictor of house value?',
    options: ['Population', 'AveRooms', 'MedInc', 'HouseAge'],
    correctIndex: 2,
    explanation: 'Median income (MedInc) has the strongest visible relationship with house value in the lab and is the first single-feature baseline in the notebook.',
  },
];

export const QUIZ_105: QuizQuestion[] = [
  {
    id: 't10r-q10',
    question: 'Which pattern is the clearest sign of overfitting?',
    options: [
      'Training and test error are both high',
      'Training error is low but test error is much worse',
      'Training and test error are both low',
      'The model has only one feature',
    ],
    correctIndex: 1,
    explanation: 'Overfitting shows up when a model looks great on training data but fails to generalize to new data. The train/test gap is the warning sign.',
  },
  {
    id: 't10r-q11',
    question: 'If a degree-1 model misses a curved pattern, the most likely problem is:',
    options: [
      'Overfitting',
      'Underfitting',
      'Data leakage',
      'Too many parameters',
    ],
    correctIndex: 1,
    explanation: 'A line can be too simple for a curved pattern. That is underfitting: the model does not have enough flexibility to capture the main relationship in the data.',
  },
];
