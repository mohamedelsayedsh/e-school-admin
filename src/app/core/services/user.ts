import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/users`;

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl);
  }

  updateUser(user: User): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(this.apiUrl, user);
  }

  deleteUser(userId: number): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('id', userId);
    return this.http.delete<ApiResponse<void>>(this.apiUrl, { params });
  }
}
