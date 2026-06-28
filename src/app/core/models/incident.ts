export interface Incident {
  analysisId: number;
  studentId: number;
  imageUrl: string;
  emotion: string;
  emotionConfidence: number;
  behavior: string;
  behaviorConfidence: number;
  createdAt: string;
}
