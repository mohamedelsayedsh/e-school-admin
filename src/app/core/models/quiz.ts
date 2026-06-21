export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions?: QuizQuestion[];
}
export interface QuizQuestion {
  id: number;
  text: string;
  order: number;
  options: QuizQuestionOption[];
}
export interface CreateQuizDto {
  title: string;
  description: string;
}
export interface QuizQuestionOption{
  text: string;
  value: string;
}
export interface CreateQuizQuestionDto {
  text: string;
  order: number;
  featureKey: string;
  options: QuizQuestionOption[];
}

