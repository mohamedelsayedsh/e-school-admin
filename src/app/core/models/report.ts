export interface ReportInterface {
  id: number;
  studentId: number;
  weekNumber: number;
  totalImages: number;
  sleepingCount: number;
  lookingBackCount: number;
  handRaisedCount: number;
  writtingCount: number;
  readingCount: number;
  standingCount: number;
  lookingForwardCount: number;
  avgConfidence: number;
  riskLevel: string;
  status: string;
  recomendation: string;
}
