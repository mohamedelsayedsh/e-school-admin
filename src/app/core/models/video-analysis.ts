export interface VideoAnalysisResponse {
  status: string;
  source: string;
  filename: string;
  prediction: number[] | number[][]; 
}
