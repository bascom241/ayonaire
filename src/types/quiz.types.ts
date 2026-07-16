export enum QuizStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  CLOSED = "closed",
  ARCHIVED = "archived",
}

export interface CreateQuizDto {
  title: string;
  moduleId: string;
  createdBy?: string;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  allowRetakes: boolean;
  status?: string;
  dueDate?: string;
}

export interface CreateQuizResponseDto {
  _id: string;
  title: string;
  moduleId: string;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  allowRetakes: boolean;
}

export interface UpdateQuizDto {
  title?: string;
  randomizeQuestions?: boolean;
  showCorrectAnswers?: boolean;
  allowRetakes?: boolean;
  status?: string;
  dueDate?: string;
}

export interface QuizListItem {
  _id: string;
  title: string;
  status: string;
  dueDate?: Date | null;
  createdBy?: { _id: string; name: string } | null;
  course?: { _id: string; title: string } | null;
  module: string;
  questionsCount: number;
  totalPoints: number;
  attemptsCount: number;
  avgScore: number | null;
  createdAt: Date;
}

export interface QuizResultAttempt {
  attemptId: string;
  student: { _id: string; name: string; email: string };
  score: number;
  totalPoints: number;
  percentage: number;
  completed: boolean;
  submittedAt: Date;
}

export type Options = {
  text: string;
  isCorrect: boolean;
};

export interface CreateQuestionDto {
  quizId: string;
  question: string;
  options: Options[];
  multipleCorrectAnswer: boolean;
  randomizeChoice: boolean;
  points: number;
}

export interface CreateQuestionResponse {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  multipleCorrectAnswer: boolean;
  randomizeChoice: boolean;
  points: number;
}

export interface SubmitQuizDto {
  quizId: string;
  userId: string;
  answers: {
    questionId: string;
    selectedOptions: string[];
  }[];
}

export interface SubmitQuizResponse {
  score: number;
  answers: {
    question: string;
    selectedOptions: string[];
    isCorrect: boolean;
  }[];
}
