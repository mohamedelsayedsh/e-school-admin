import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { QuizService } from './quiz';
import { environment } from '../../../environments/environment';
import { CreateQuizDto, CreateQuizQuestionDto } from '../models/quiz';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/admin/quizzes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllQuizzes', () => {
    it('should send a GET to /admin/quizzes', () => {
      service.getAllQuizzes().subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] });
    });

    it('should return the list of quizzes from the response', () => {
      const mockQuizzes = [{ id: 1, title: 'Quiz A', description: 'desc' }];
      let actual: any;

      service.getAllQuizzes().subscribe((res) => (actual = res));

      httpMock.expectOne(baseUrl).flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockQuizzes });

      expect(actual.result).toEqual(mockQuizzes);
    });
  });

  describe('createQuiz', () => {
    it('should send a POST to /admin/quizzes with the quiz data as the body', () => {
      const dto: CreateQuizDto = { title: 'New Quiz', description: 'A new quiz' };

      service.createQuiz(dto).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: null });
    });

    it('should propagate a validation error from the backend', () => {
      let caughtError: any;
      service.createQuiz({ title: '', description: '' }).subscribe({ error: (err) => (caughtError = err) });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

      expect(caughtError.status).toBe(400);
    });
  });

  describe('addQuestionToQuiz', () => {
    it('should send a POST to /admin/quizzes/:quizId/questions', () => {
      const dto: CreateQuizQuestionDto = {
        text: 'Is the student sleeping?',
        order: 1,
        featureKey: 'sleep',
        options: [{ text: 'Yes', value: '1' }, { text: 'No', value: '0' }],
      };

      service.addQuestionToQuiz(7, dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/7/questions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: null });
    });

    it('should build the correct url for different quiz ids', () => {
      service.addQuestionToQuiz(1, {} as CreateQuizQuestionDto).subscribe();
      service.addQuestionToQuiz(2, {} as CreateQuizQuestionDto).subscribe();

      httpMock.expectOne(`${baseUrl}/1/questions`).flush({});
      httpMock.expectOne(`${baseUrl}/2/questions`).flush({});
    });

    it('should send the full options array intact in the body', () => {
      const dto: CreateQuizQuestionDto = {
        text: 'Q', order: 1, featureKey: 'k',
        options: [{ text: 'A', value: '0' }, { text: 'B', value: '1' }, { text: 'C', value: '2' }],
      };

      service.addQuestionToQuiz(1, dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/1/questions`);
      expect(req.request.body.options.length).toBe(3);
      expect(req.request.body.options[2]).toEqual({ text: 'C', value: '2' });
      req.flush({});
    });
  });

  describe('getAllQuizAnalyses', () => {
    it('should send a GET to /admin/quizzes/analyses (NOT /admin/quizzes itself)', () => {
      service.getAllQuizAnalyses().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/analyses`);
      expect(req.request.method).toBe('GET');
      // explicitly confirm it did NOT just hit the base quizzes url
      expect(req.request.url).not.toBe(baseUrl);
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] });
    });

    it('should return the analyses array from the response', () => {
      const mockAnalyses = [{ id: 1, studentId: 10, risk_score: 0.8, risk_level: 'Severe', createdAt: '2026-01-01' }];
      let actual: any;

      service.getAllQuizAnalyses().subscribe((res) => (actual = res));

      httpMock.expectOne(`${baseUrl}/analyses`).flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockAnalyses });

      expect(actual.result).toEqual(mockAnalyses);
    });
  });
});
