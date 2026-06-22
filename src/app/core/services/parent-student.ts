import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { ParentStudent } from '../models/parent-student';

@Injectable({
  providedIn: 'root',
})
export class ParentStudentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/parent-student`;

  getLinkedParentsStudents() : Observable<ApiResponse<ParentStudent[]>> {
    return this.http.get<ApiResponse<ParentStudent[]>>(`${this.apiUrl}/linked-parents-students`);
  }
}
