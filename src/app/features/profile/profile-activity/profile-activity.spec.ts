import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ProfileActivity } from './profile-activity';
import { QuizService } from '../../../core/services/quiz';
import { ReportService } from '../../../core/services/report';
import { QuizAnalysis } from '../../../core/models/quiz';
import { ReportInterface } from '../../../core/models/report';

describe('ProfileActivity', () => {
  let component: ProfileActivity;
  let fixture: ComponentFixture<ProfileActivity>;
  let quizServiceSpy: { getAllQuizAnalyses: ReturnType<typeof vi.fn> };
  let reportServiceSpy: { getAllReports: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  const allQuizAnalyses: QuizAnalysis[] = [
    { id: 1, studentId: 10, risk_score: 0.8, risk_level: 'Severe', createdAt: '2026-06-01' },
    { id: 2, studentId: 11, risk_score: 0.2, risk_level: 'Low', createdAt: '2026-06-02' },
    { id: 3, studentId: 10, risk_score: 0.5, risk_level: 'Moderate', createdAt: '2026-06-03' },
  ];

  const allReports: ReportInterface[] = [
    { id: 1, studentId: 10, weekNumber: 1, totalImages: 10, sleepingCount: 0, lookingBackCount: 0, handRaisedCount: 0, writtingCount: 0, readingCount: 0, standingCount: 0, lookingForwardCount: 0, avgConfidence: 0.9, riskLevel: 'Low', status: 'Approved', recomendation: 'ok' },
    { id: 2, studentId: 11, weekNumber: 1, totalImages: 10, sleepingCount: 0, lookingBackCount: 0, handRaisedCount: 0, writtingCount: 0, readingCount: 0, standingCount: 0, lookingForwardCount: 0, avgConfidence: 0.9, riskLevel: 'Low', status: 'Approved', recomendation: 'ok' },
  ];

  function setup(studentId: number) {
    fixture = TestBed.createComponent(ProfileActivity);
    fixture.componentRef.setInput('studentId', studentId);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    quizServiceSpy = { getAllQuizAnalyses: vi.fn() };
    reportServiceSpy = { getAllReports: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    quizServiceSpy.getAllQuizAnalyses.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: allQuizAnalyses })
    );
    reportServiceSpy.getAllReports.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: allReports })
    );

    await TestBed.configureTestingModule({
      imports: [ProfileActivity],
      providers: [
        provideRouter([]),
        { provide: QuizService, useValue: quizServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    setup(10);
    expect(component).toBeTruthy();
  });

  it('should filter quizAnalyses down to only the given studentId', () => {
    setup(10);

    expect(component.quizAnalyses().map(q => q.id)).toEqual([1, 3]);
    expect(component.isLoadingQuizzes()).toBe(false);
  });

  it('should filter reports down to only the given studentId', () => {
    setup(10);

    expect(component.reports().map(r => r.id)).toEqual([1]);
    expect(component.isLoadingReports()).toBe(false);
  });

  it('should produce an empty quizAnalyses list for a student with no submissions', () => {
    setup(999);

    expect(component.quizAnalyses()).toEqual([]);
    expect(component.isLoadingQuizzes()).toBe(false);
  });

  it('should produce an empty reports list for a student with no reports', () => {
    setup(999);

    expect(component.reports()).toEqual([]);
  });

  it('should default to an empty array (not crash) when result is null on success', () => {
    quizServiceSpy.getAllQuizAnalyses.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null })
    );
    setup(10);

    expect(component.quizAnalyses()).toEqual([]);
  });

  it('should stop the quizzes loading flag even when the quiz analyses request errors out', () => {
    quizServiceSpy.getAllQuizAnalyses.mockReturnValue(throwError(() => new Error('network down')));
    setup(10);

    expect(component.isLoadingQuizzes()).toBe(false);
    expect(component.quizAnalyses()).toEqual([]);
  });

  it('should stop the reports loading flag even when the reports request errors out', () => {
    reportServiceSpy.getAllReports.mockReturnValue(throwError(() => new Error('network down')));
    setup(10);

    expect(component.isLoadingReports()).toBe(false);
    expect(component.reports()).toEqual([]);
  });

  it('quizzes and reports loading should be independent of each other (one failing does not block the other)', () => {
    quizServiceSpy.getAllQuizAnalyses.mockReturnValue(throwError(() => new Error('quiz service down')));
    reportServiceSpy.getAllReports.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: allReports })
    );
    setup(10);

    expect(component.quizAnalyses()).toEqual([]);
    expect(component.reports().map(r => r.id)).toEqual([1]); // reports still loaded fine
  });

  it('goToReport should navigate to /reports/:id with whatever id value it is given', () => {
    setup(10);
    component.goToReport(42);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/reports', 42]);
  });

  it('⚠ KNOWN ISSUE: the template calls goToReport(report.studentId) instead of report.id', () => {
    // Same class of bug as reports-list.html: profile-activity.html's "View" button calls
    // goToReport(report.studentId), but the /reports/:id route and ReportService.getReportById
    // both expect the REPORT's own id. For students with multiple reports, studentId stays
    // constant across all their reports while id varies — so every "View" click for this
    // student's reports navigates to the SAME (likely wrong) report id, namely their
    // studentId value reinterpreted as a report id.
    // Documenting rather than silently fixing, since swapping report.studentId -> report.id
    // in the template is a behavior change and the user is editing HTML themselves this round.
    const reportsForStudent10 = allReports.filter(r => r.studentId === 10);
    expect(reportsForStudent10.length).toBeGreaterThan(0);
    expect(reportsForStudent10[0].id).not.toBe(reportsForStudent10[0].studentId);
  });
});
