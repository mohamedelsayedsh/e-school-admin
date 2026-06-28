import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { CreateQuizDto, CreateQuizQuestionDto, Quiz, QuizAnalysis } from '../models/quiz';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/quizzes`;

  getAllQuizzes() : Observable<ApiResponse<Quiz[]>> {
    return this.http.get<ApiResponse<Quiz[]>>(this.apiUrl);
  }
  createQuiz(quizData: CreateQuizDto) : Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl,quizData);
  }

  addQuestionToQuiz (quizId: number, questionData: CreateQuizQuestionDto): Observable<ApiResponse<any>>{
    const url = `${this.apiUrl}/${quizId}/questions`;
    return this.http.post<ApiResponse<any>>(url,questionData);
  }

  getAllQuizAnalyses(): Observable<ApiResponse<QuizAnalysis[]>> {
    // apiUrl = /admin/quizzes
    return this.http.get<ApiResponse<QuizAnalysis[]>>(`${this.apiUrl}/analyses`);
  }
}
