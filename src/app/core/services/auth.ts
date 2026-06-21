import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResult {
  message: string;
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user/login`;

  login(data: { userName: string; password: string }): Observable<ApiResponse<LoginResult>> {
    return this.http.post<ApiResponse<LoginResult>>(this.apiUrl,data).pipe(
      tap((response) => {
        if (response.isSuccess && response.result){
          localStorage.setItem('authToken', response.result.token);
          localStorage.setItem('user-name', data.userName);
          // localStorage.setItem('userRole', response.result.role);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  getUserName(): string {
    return localStorage.getItem('user-name') || 'Admin';
  }
  // getRole(): string | null {
  //   return localStorage.getItem('userRole');
  // }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  logout() {
    localStorage.removeItem('authToken');
    // localStorage.removeItem('userRole');
  }
}
