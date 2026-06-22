import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { ReportInterface } from '../models/report';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Report`;

  getAllReports(): Observable<ApiResponse<ReportInterface[]>> {
    return this.http.get<ApiResponse<ReportInterface[]>>(this.apiUrl);
  }

  getReportById(id: number): Observable<ApiResponse<ReportInterface[]>> {
    return this.http.get<ApiResponse<ReportInterface[]>>(`${this.apiUrl}/${id}`);
  }
  updateReportAction(
    id: number,
    updateData: { riskLevel: string; status: string; recomendations: string }
  ): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}`, updateData);
  }
}
