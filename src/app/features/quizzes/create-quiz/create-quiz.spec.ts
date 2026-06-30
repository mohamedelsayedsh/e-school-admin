import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreateQuiz } from './create-quiz';
import { QuizService } from '../../../core/services/quiz';

describe('CreateQuiz', () => {
  let component: CreateQuiz;
  let fixture: ComponentFixture<CreateQuiz>;
  let quizServiceSpy: { createQuiz: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    quizServiceSpy = { createQuiz: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CreateQuiz],
      providers: [{ provide: QuizService, useValue: quizServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateQuiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid empty form', () => {
    expect(component.quizForm.invalid).toBe(true);
  });

  it('should require a title of at least 3 characters', () => {
    component.f['title'].setValue('ab');
    expect(component.f['title'].errors?.['minlength']).toBeTruthy();

    component.f['title'].setValue('abc');
    expect(component.f['title'].errors).toBeNull();
  });

  it('should require a non-empty description', () => {
    component.f['description'].setValue('');
    expect(component.f['description'].errors?.['required']).toBeTruthy();

    component.f['description'].setValue('Some description');
    expect(component.f['description'].errors).toBeNull();
  });

  it('onSubmit should mark all fields touched and not call the service when the form is invalid', () => {
    component.onSubmit();

    expect(quizServiceSpy.createQuiz).not.toHaveBeenCalled();
    expect(component.f['title'].touched).toBe(true);
    expect(component.f['description'].touched).toBe(true);
  });

  it('onSubmit should call createQuiz with the form value when valid', () => {
    quizServiceSpy.createQuiz.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null }));
    component.quizForm.setValue({ title: 'New Quiz', description: 'A description' });

    component.onSubmit();

    expect(quizServiceSpy.createQuiz).toHaveBeenCalledWith({ title: 'New Quiz', description: 'A description' });
  });

  it('onSubmit should emit quizCreated and closeModal on success', () => {
    quizServiceSpy.createQuiz.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null }));

    let createdEmitted = false;
    let closedEmitted = false;
    component.quizCreated.subscribe(() => (createdEmitted = true));
    component.closeModal.subscribe(() => (closedEmitted = true));

    component.quizForm.setValue({ title: 'New Quiz', description: 'A description' });
    component.onSubmit();

    expect(createdEmitted).toBe(true);
    expect(closedEmitted).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('onSubmit should NOT emit on backend failure and should show the error message', () => {
    quizServiceSpy.createQuiz.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: ['Title already exists'], result: null })
    );

    let createdEmitted = false;
    component.quizCreated.subscribe(() => (createdEmitted = true));

    component.quizForm.setValue({ title: 'New Quiz', description: 'A description' });
    component.onSubmit();

    expect(createdEmitted).toBe(false);
    expect(component.errorMessage).toBe('Title already exists');
    expect(component.isLoading).toBe(false);
  });

  it('onSubmit should fall back to a generic error message on failure with no errorMessages', () => {
    quizServiceSpy.createQuiz.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: [], result: null })
    );

    component.quizForm.setValue({ title: 'New Quiz', description: 'A description' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Failed to create quiz');
  });

  it('onSubmit should show a connection error message when the request errors out', () => {
    quizServiceSpy.createQuiz.mockReturnValue(throwError(() => new Error('network down')));

    component.quizForm.setValue({ title: 'New Quiz', description: 'A description' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Connection error. Please try again.');
    expect(component.isLoading).toBe(false);
  });
});
