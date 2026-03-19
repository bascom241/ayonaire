export interface CreateQuizDto {
  title: string;
  moduleId: string;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  allowRetakes: boolean;
}

export interface CreateQuizResponseDto {
  title: string;
  moduleId: string;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  allowRetakes: boolean;
}

export type Options = {
  text: string;
  isCorrect: boolean
};

export interface CreateQuestionDto {
    quizId: string 
  question: string;
  options: Options[];
  multipleCorrectAnswer: boolean;
  randomizeChoice: boolean;
  points: number;
}

export interface CreateQuestionResponse {
    question: string 
    options: {
        text: string
        isCorrect: boolean
    }[]
    multipleCorrectAnswer: boolean
    randomizeChoice: boolean
    points: number
}

export interface SubmitQuizDto {
  quizId: string
  userId: string
  answers: {
    questionId: string
    selectedOptions: string[]
  }[]
}

export interface SubmitQuizResponse {
  score: number
  answers: {
    question: string
    selectedOptions: string[]
    isCorrect: boolean
  }[]
}
