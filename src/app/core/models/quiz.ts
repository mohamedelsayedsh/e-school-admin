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

export interface QuizAnalysis {
  id: number;
  studentId: number;
  risk_score: number;
  risk_level: string;
  createdAt: string;
}
