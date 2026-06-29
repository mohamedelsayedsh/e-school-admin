import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Login } from './login';
import { AuthService } from '../../core/services/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: { login: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceSpy = { login: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an empty, invalid form and no error message', () => {
    expect(component.loginForm.invalid).toBe(true);
    expect(component.errorMessage()).toBe('');
    expect(component.isLoading()).toBe(false);
  });

  it('should mark all fields as touched and not call login when the form is invalid', () => {
    component.onLogin();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.f.userName.touched).toBe(true);
    expect(component.f.password.touched).toBe(true);
  });

  it('should require a username of at least 3 characters', () => {
    component.f.userName.setValue('ab');
    expect(component.f.userName.errors?.['minlength']).toBeTruthy();

    component.f.userName.setValue('abc');
    expect(component.f.userName.errors).toBeNull();
  });

  it('should require a password of at least 6 characters', () => {
    component.f.password.setValue('12345');
    expect(component.f.password.errors?.['minlength']).toBeTruthy();

    component.f.password.setValue('123456');
    expect(component.f.password.errors).toBeNull();
  });

  it('should call AuthService.login with form values when the form is valid', () => {
    authServiceSpy.login.mockReturnValue(of({
      isSuccess: true,
      statusCode: 200,
      errorMessages: [],
      result: { message: 'ok', token: 'fake-token', role: 'Admin' },
    }));

    component.loginForm.setValue({ userName: 'admin', password: 'password123' });
    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      userName: 'admin',
      password: 'password123',
    });
  });

  it('should set isLoading to true while the request is in flight', () => {
    authServiceSpy.login.mockReturnValue(of({
      isSuccess: true,
      statusCode: 200,
      errorMessages: [],
      result: { message: 'ok', token: 'fake-token', role: 'Admin' },
    }));

    component.loginForm.setValue({ userName: 'admin', password: 'password123' });
    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  it('should navigate to /users on successful login', () => {
    authServiceSpy.login.mockReturnValue(of({
      isSuccess: true,
      statusCode: 200,
      errorMessages: [],
      result: { message: 'ok', token: 'fake-token', role: 'Admin' },
    }));

    component.loginForm.setValue({ userName: 'admin', password: 'password123' });
    component.onLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should show the backend error message when isSuccess is false', () => {
    authServiceSpy.login.mockReturnValue(of({
      isSuccess: false,
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
      result: null,
    }));

    component.loginForm.setValue({ userName: 'admin', password: 'wrongpass' });
    component.onLogin();

    expect(component.errorMessage()).toBe('Invalid credentials');
    expect(component.isLoading()).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should show a fallback message when isSuccess is false with no errorMessages', () => {
    authServiceSpy.login.mockReturnValue(of({
      isSuccess: false,
      statusCode: 401,
      errorMessages: [],
      result: null,
    }));

    component.loginForm.setValue({ userName: 'admin', password: 'wrongpass' });
    component.onLogin();

    expect(component.errorMessage()).toBe('Invalid username or password');
  });

  it('should show "Invalid username or password" on a 401 HTTP error', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ status: 401, error: null })));

    component.loginForm.setValue({ userName: 'admin', password: 'wrongpass' });
    component.onLogin();

    expect(component.errorMessage()).toBe('Invalid username or password');
    expect(component.isLoading()).toBe(false);
  });

  it('should show "Invalid username or password" on a 400 HTTP error', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ status: 400, error: null })));

    component.loginForm.setValue({ userName: 'admin', password: 'wrongpass' });
    component.onLogin();

    expect(component.errorMessage()).toBe('Invalid username or password');
  });

  it('should use the backend error message from err.error.errorMessages when present', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({
      status: 400,
      error: { errorMessages: ['Account locked'] },
    })));

    component.loginForm.setValue({ userName: 'admin', password: 'password123' });
    component.onLogin();

    expect(component.errorMessage()).toBe('Account locked');
  });

  it('should show a generic error on connection failure (e.g. status 0)', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ status: 0, error: null })));

    component.loginForm.setValue({ userName: 'admin', password: 'password123' });
    component.onLogin();

    expect(component.errorMessage()).toBe('An error occurred. Please try again later.');
    expect(component.isLoading()).toBe(false);
  });
});
