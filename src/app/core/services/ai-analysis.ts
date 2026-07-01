import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { VideoAnalysisResponse } from '../models/video-analysis';

@Injectable({
  providedIn: 'root',
})
export class AiAnalysisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/images`;
  analyzeClassImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(`${this.apiUrl}/analyze-class`, formData);
  }
analyzeVideo(file: File): Observable<VideoAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<VideoAnalysisResponse>(
    `${this.apiUrl}/analyze-video`,
    formData
  );
}
}
