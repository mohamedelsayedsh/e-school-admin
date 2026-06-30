import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuizBuilder } from './quiz-builder';
import { QuizService } from '../../../core/services/quiz';

describe('QuizBuilder', () => {
  let component: QuizBuilder;
  let fixture: ComponentFixture<QuizBuilder>;
  let quizServiceSpy: { addQuestionToQuiz: ReturnType<typeof vi.fn> };
  let alertSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    quizServiceSpy = { addQuestionToQuiz: vi.fn() };
    alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);

    await TestBed.configureTestingModule({
      imports: [QuizBuilder],
      providers: [
        provideRouter([]),
        { provide: QuizService, useValue: quizServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizBuilder);
    fixture.componentRef.setInput('quizId', 1);
    fixture.componentRef.setInput('nextOrder', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with 2 default options and order = nextOrder()', () => {
    expect(component.options.length).toBe(2);
    expect(component.f['order'].value).toBe(1);
  });

  it('addOption should append a new option and re-index all option values sequentially', () => {
    component.addOption();
    expect(component.options.length).toBe(3);
    expect(component.options.at(0).get('value')?.value).toBe('0');
    expect(component.options.at(1).get('value')?.value).toBe('1');
    expect(component.options.at(2).get('value')?.value).toBe('2');
  });

  it('removeOption should remove the option at the given index when more than 2 remain', () => {
    component.addOption(); // now 3 options
    component.removeOption(1);

    expect(component.options.length).toBe(2);
  });

  it('removeOption should re-index remaining option values after removal', () => {
    component.addOption(); // 3 options: values 0,1,2
    component.removeOption(0); // remove the first

    expect(component.options.at(0).get('value')?.value).toBe('0');
    expect(component.options.at(1).get('value')?.value).toBe('1');
  });

  it('removeOption should NOT remove below 2 options and should alert instead', () => {
    component.removeOption(0);

    expect(component.options.length).toBe(2);
    expect(alertSpy).toHaveBeenCalledWith('A question must have at least 2 options.');
  });

  it('onSubmit should mark all fields touched and not call the service when the form is invalid', () => {
    // text and featureKey are required and empty by default
    component.onSubmit();

    expect(quizServiceSpy.addQuestionToQuiz).not.toHaveBeenCalled();
    expect(component.f['text'].touched).toBe(true);
    expect(component.f['featureKey'].touched).toBe(true);
  });

  it('onSubmit should reject a form with fewer than 2 options even if otherwise valid', () => {
    component.questionForm.patchValue({ text: 'Q1', featureKey: 'sleep' });
    // Force options down to 1 by bypassing removeOption's own guard, to test onSubmit's
    // own independent "options.length < 2" check.
    component.options.removeAt(1);
    expect(component.options.length).toBe(1);

    component.onSubmit();
    expect(quizServiceSpy.addQuestionToQuiz).not.toHaveBeenCalled();
  });

  it('onSubmit should call addQuestionToQuiz with quizId() and the form value when valid', () => {
    quizServiceSpy.addQuestionToQuiz.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null }));
    component.questionForm.patchValue({ text: 'What did the student do?', featureKey: 'sleep' });
    component.options.at(0).patchValue({ text: 'Slept' });
    component.options.at(1).patchValue({ text: 'Awake' });

    component.onSubmit();

    expect(quizServiceSpy.addQuestionToQuiz).toHaveBeenCalledWith(1, expect.objectContaining({
      text: 'What did the student do?',
      featureKey: 'sleep',
    }));
  });

  it('onSubmit should show a success message and reset the form with order incremented by 1', () => {
    quizServiceSpy.addQuestionToQuiz.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null }));
    component.questionForm.patchValue({ text: 'Q1', featureKey: 'sleep', order: 1 });
    component.options.at(0).patchValue({ text: 'A' });
    component.options.at(1).patchValue({ text: 'B' });

    component.onSubmit();

    expect(component.successMessage()).toBe('Question added successfully! Add the next one below.');
    expect(component.f['order'].value).toBe(2);
    expect(component.f['text'].value).toBe('');
    expect(component.options.length).toBe(2); // reset back to 2 fresh options
  });

  it('onSubmit should show the backend error message when isSuccess is false', () => {
    quizServiceSpy.addQuestionToQuiz.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: ['Duplicate question'], result: null })
    );
    component.questionForm.patchValue({ text: 'Q1', featureKey: 'sleep' });
    component.options.at(0).patchValue({ text: 'A' });
    component.options.at(1).patchValue({ text: 'B' });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Duplicate question');
    expect(component.isLoading()).toBe(false);
  });

  it('onSubmit should show a connection error message when the request errors out', () => {
    quizServiceSpy.addQuestionToQuiz.mockReturnValue(throwError(() => new Error('network down')));
    component.questionForm.patchValue({ text: 'Q1', featureKey: 'sleep' });
    component.options.at(0).patchValue({ text: 'A' });
    component.options.at(1).patchValue({ text: 'B' });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Connection error. Question was not saved.');
    expect(component.isLoading()).toBe(false);
  });

  it('resetForm should clear the options array back down to exactly 2 fresh options', () => {
    component.addOption();
    component.addOption();
    expect(component.options.length).toBe(4);

    component.resetForm(5);

    expect(component.options.length).toBe(2);
    expect(component.f['order'].value).toBe(5);
    expect(component.f['text'].value).toBe('');
  });
});
