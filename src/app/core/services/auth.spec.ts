import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn should return false when there is no token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login should store the token and username on success', () => {
    service.login({ userName: 'admin', password: 'pass1234' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/user/login`);
    req.flush({
      isSuccess: true,
      statusCode: 200,
      errorMessages: [],
      result: { message: 'ok', token: 'fake-token-123', role: 'Admin' },
    });

    expect(service.getToken()).toBe('fake-token-123');
    expect(service.getUserName()).toBe('admin');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('login should NOT store a token when the backend reports failure', () => {
    service.login({ userName: 'admin', password: 'wrongpass' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/user/login`);
    req.flush({
      isSuccess: false,
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
      result: null,
    });

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('logout should clear the stored token and username', () => {
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('user-name', 'admin');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getUserName()).toBe('Admin');
    expect(service.isLoggedIn()).toBe(false);
  });
});
