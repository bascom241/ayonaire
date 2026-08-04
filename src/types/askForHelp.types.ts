export interface MediaData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface AskForHelpAnswer {
  id?: string;
  user: {
    id: string;
    name: string;
  };
  text: string;
  createdAt: string;
}

export interface AskForHelpQuestionResponse {
  id: string;
  content: string;
  media?: {
    url: string;
    publicId: string;
  };
  tags: string[];
  resolved: boolean;
  user: {
    id: string;
    name: string;
    profile?: {
      url: string;
      publicId: string;
    } | null;
  };
  likes: string[];
  answers: AskForHelpAnswer[];
  shares: number;
  createdAt: string;
}

export interface CreateAskForHelpQuestionRequest {
  content: string;
  tags?: string[];
  media?: MediaData;
}

export interface EditAskForHelpQuestionRequest {
  questionId: string;
  content?: string;
  tags?: string[];
  media?: MediaData;
}

export interface DeleteAskForHelpQuestionRequest {
  questionId: string;
}

export interface ViewAskForHelpQuestionsQuery {
  resolved?: boolean;
  page?: number;
  limit?: number;
}

export interface LikeAskForHelpQuestionRequest {
  questionId: string | undefined;
}

export interface AnswerAskForHelpQuestionRequest {
  questionId: string | undefined;
  text: string;
}

export interface DeleteAskForHelpAnswerRequest {
  questionId: string;
  answerId: string;
}

export interface ShareAskForHelpQuestionRequest {
  questionId: string | undefined;
}

export interface ShareAskForHelpQuestionResponse {
  questionId: string;
  shares: number;
}

export interface ResolveAskForHelpQuestionRequest {
  questionId: string | undefined;
  resolved: boolean;
}
