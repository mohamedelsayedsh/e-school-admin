import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuizzesList } from './quizzes-list';
import { QuizService } from '../../../core/services/quiz';
import { Quiz } from '../../../core/models/quiz';

describe('QuizzesList', () => {
  let component: QuizzesList;
  let fixture: ComponentFixture<QuizzesList>;
  let quizServiceSpy: { getAllQuizzes: ReturnType<typeof vi.fn> };

  const mockQuizzes: Quiz[] = [
    { id: 1, title: 'Quiz A', description: 'desc A', questions: [{ id: 1, text: 'q1', order: 1, options: [] }, { id: 2, text: 'q2', order: 2, options: [] }] },
    { id: 2, title: 'Quiz B', description: 'desc B' }, // no questions array at all
    { id: 3, title: 'Quiz C', description: 'desc C', questions: [] }, // empty questions array
  ];

  function setup() {
    fixture = TestBed.createComponent(QuizzesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    quizServiceSpy = { getAllQuizzes: vi.fn() };
    quizServiceSpy.getAllQuizzes.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockQuizzes })
    );

    await TestBed.configureTestingModule({
      imports: [QuizzesList],
      providers: [
        provideRouter([]),
        { provide: QuizService, useValue: quizServiceSpy },
      ],
    }).compileComponents();

    setup();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load quizzes on init', () => {
    expect(component.quizzes()).toEqual(mockQuizzes);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('should default quizzes to an empty array when result is falsy even on success', () => {
    quizServiceSpy.getAllQuizzes.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null })
    );
    setup();

    expect(component.quizzes()).toEqual([]);
  });

  it('should set errorMessage when the backend reports failure', () => {
    quizServiceSpy.getAllQuizzes.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: ['Bad request'], result: null })
    );
    setup();

    expect(component.errorMessage()).toBe('Bad request');
    expect(component.isLoading()).toBe(false);
  });

  it('should set a fallback error message on failure with no errorMessages', () => {
    quizServiceSpy.getAllQuizzes.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: [], result: null })
    );
    setup();

    expect(component.errorMessage()).toBe('Failed to load quizzes.');
  });

  it('should set a connection error message when the request errors out', () => {
    quizServiceSpy.getAllQuizzes.mockReturnValue(throwError(() => new Error('network down')));
    setup();

    expect(component.errorMessage()).toBe('Connection error. Please check your backend.');
    expect(component.isLoading()).toBe(false);
  });

  it('openCreateQuizModal should open the create-quiz modal', () => {
    expect(component.isModalOpen()).toBe(false);
    component.openCreateQuizModal();
    expect(component.isModalOpen()).toBe(true);
  });

  it('editQuiz should select the quiz and set nextOrder to questions.length + 1 when questions exist', () => {
    component.editQuiz(1); // Quiz A has 2 questions

    expect(component.selectedQuizId()).toBe(1);
    expect(component.selectedNextOrder()).toBe(3);
    expect(component.isBuilderModalOpen()).toBe(true);
  });

  it('editQuiz should default nextOrder to 1 when the quiz has no questions array at all', () => {
    component.editQuiz(2); // Quiz B has no questions field

    expect(component.selectedQuizId()).toBe(2);
    expect(component.selectedNextOrder()).toBe(1);
  });

  it('editQuiz should default nextOrder to 1 when the quiz has an empty questions array', () => {
    component.editQuiz(3); // Quiz C has questions: []

    expect(component.selectedQuizId()).toBe(3);
    expect(component.selectedNextOrder()).toBe(1);
  });

  it('editQuiz should default nextOrder to 1 when the quiz id is not found at all', () => {
    component.editQuiz(999);

    expect(component.selectedQuizId()).toBe(999);
    expect(component.selectedNextOrder()).toBe(1);
    expect(component.isBuilderModalOpen()).toBe(true);
  });

  it('viewQuiz should set selectedViewQuiz and open the view modal', () => {
    const quiz = mockQuizzes[0];
    component.viewQuiz(quiz);

    expect(component.selectedViewQuiz()).toEqual(quiz);
    expect(component.isViewModalOpen()).toBe(true);
  });
});
