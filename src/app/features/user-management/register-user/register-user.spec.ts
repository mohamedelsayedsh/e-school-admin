import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { RegisterUser } from './register-user';
import { UserService } from '../../../core/services/user';

describe('RegisterUser', () => {
  let component: RegisterUser;
  let fixture: ComponentFixture<RegisterUser>;
  let userServiceSpy: { registerUser: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.useFakeTimers();

    userServiceSpy = { registerUser: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterUser],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with isLoading true and clear it after the simulated load delay', () => {
    expect(component.isLoading()).toBe(true);

    vi.advanceTimersByTime(500);

    expect(component.isLoading()).toBe(false);
  });

  it('should start with an invalid empty form', () => {
    expect(component.registerForm.invalid).toBe(true);
  });

  describe('field validation', () => {
    it('userName should require at least 3 characters', () => {
      component.f['userName'].setValue('ab');
      expect(component.f['userName'].errors?.['minlength']).toBeTruthy();
      component.f['userName'].setValue('abc');
      expect(component.f['userName'].errors).toBeNull();
    });

    it('email should require a valid email format', () => {
      component.f['email'].setValue('not-an-email');
      expect(component.f['email'].errors?.['email']).toBeTruthy();
      component.f['email'].setValue('valid@test.com');
      expect(component.f['email'].errors).toBeNull();
    });

    it('password should reject values missing uppercase/lowercase/digit/special char', () => {
      const cases = ['alllowercase1!', 'ALLUPPERCASE1!', 'NoDigitsHere!', 'NoSpecial123'];
      for (const value of cases) {
        component.f['password'].setValue(value);
        expect(component.f['password'].errors?.['pattern']).toBeTruthy();
      }
    });

    it('password should accept a value meeting all complexity rules', () => {
      component.f['password'].setValue('Valid123!');
      expect(component.f['password'].errors).toBeNull();
    });

    it('password should reject values shorter than 8 characters even if complex', () => {
      component.f['password'].setValue('Va1!');
      expect(component.f['password'].errors?.['minlength'] || component.f['password'].errors?.['pattern']).toBeTruthy();
    });

    it('phoneNumber should accept valid Egyptian formats (01, +201, 00201 prefixes)', () => {
      const validNumbers = ['01012345678', '+201012345678', '0020 1012345678'.replace(' ', '')];
      for (const num of validNumbers) {
        component.f['phoneNumber'].setValue(num);
        expect(component.f['phoneNumber'].errors).toBeNull();
      }
    });

    it('phoneNumber should reject malformed numbers', () => {
      const invalidNumbers = ['123456789', '01912345678', 'not-a-number'];
      for (const num of invalidNumbers) {
        component.f['phoneNumber'].setValue(num);
        expect(component.f['phoneNumber'].errors?.['pattern']).toBeTruthy();
      }
    });

    it('roleID should be required', () => {
      expect(component.f['roleID'].errors?.['required']).toBeTruthy();
      component.f['roleID'].setValue(2);
      expect(component.f['roleID'].errors).toBeNull();
    });
  });

  it('selectRole should patch roleID and mark it as touched', () => {
    component.selectRole(2);

    expect(component.f['roleID'].value).toBe(2);
    expect(component.f['roleID'].touched).toBe(true);
  });

  it('resetForm should clear the form and any messages', () => {
    component.registerForm.patchValue({ userName: 'Test' });
    component.errorMessage.set('some error');
    component.successMessage.set('some success');

    component.resetForm();

    expect(component.registerForm.value.userName).toBeNull();
    expect(component.errorMessage()).toBe('');
    expect(component.successMessage()).toBe('');
  });

  function fillValidForm() {
    component.registerForm.setValue({
      userName: 'NewUser',
      email: 'newuser@test.com',
      password: 'Valid123!',
      phoneNumber: '01012345678',
      roleID: 2,
    });
  }

  it('onSubmit should mark all fields touched and not call the service when the form is invalid', () => {
    component.onSubmit();

    expect(userServiceSpy.registerUser).not.toHaveBeenCalled();
    expect(component.f['userName'].touched).toBe(true);
    expect(component.f['roleID'].touched).toBe(true);
  });

  it('onSubmit should call registerUser with the form value when valid', () => {
    userServiceSpy.registerUser.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null }));
    fillValidForm();

    component.onSubmit();

    expect(userServiceSpy.registerUser).toHaveBeenCalledWith(expect.objectContaining({
      userName: 'NewUser',
      email: 'newuser@test.com',
      roleID: 2,
    }));
  });

  it('onSubmit should show a success message immediately, then navigate after the delay', () => {
    userServiceSpy.registerUser.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null }));
    fillValidForm();

    component.onSubmit();

    expect(component.successMessage()).toBe('User registered successfully! Redirecting...');
    expect(routerSpy.navigate).not.toHaveBeenCalled(); // not yet — still waiting on the timeout

    vi.advanceTimersByTime(1500);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    expect(component.isLoading()).toBe(false);
  });

  it('onSubmit should show the backend error message and NOT navigate on failure', () => {
    userServiceSpy.registerUser.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: ['Email already registered'], result: null })
    );
    fillValidForm();

    component.onSubmit();

    expect(component.errorMessage()).toBe('Email already registered');
    expect(component.isLoading()).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('onSubmit should fall back to a generic error message on failure with no errorMessages', () => {
    userServiceSpy.registerUser.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: [], result: null })
    );
    fillValidForm();

    component.onSubmit();

    expect(component.errorMessage()).toBe('Failed to register user.');
  });

  it('onSubmit should use err.error.errorMessages when the request itself errors out', () => {
    userServiceSpy.registerUser.mockReturnValue(
      throwError(() => ({ error: { errorMessages: ['Phone number already in use'] } }))
    );
    fillValidForm();

    component.onSubmit();

    expect(component.errorMessage()).toBe('Phone number already in use');
    expect(component.isLoading()).toBe(false);
  });

  it('onSubmit should show a generic connection error when err.error is missing entirely', () => {
    userServiceSpy.registerUser.mockReturnValue(throwError(() => ({ error: null })));
    fillValidForm();

    component.onSubmit();

    expect(component.errorMessage()).toBe('Connection error. Please try again.');
  });
});
