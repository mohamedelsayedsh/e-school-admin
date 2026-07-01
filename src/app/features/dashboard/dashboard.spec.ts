import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { UserService } from '../../core/services/user';
import { IncidentService } from '../../core/services/incident';
import { QuizService } from '../../core/services/quiz';
import { ReportService } from '../../core/services/report';
import { provideRouter } from '@angular/router';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let userServiceMock: { getAllUsers: ReturnType<typeof vi.fn> };
  let incidentServiceMock: { getAllIncidents: ReturnType<typeof vi.fn> };
  let quizServiceMock: { getAllQuizAnalyses: ReturnType<typeof vi.fn>; getAllQuizzes: ReturnType<typeof vi.fn> };
  let reportServiceMock: { getAllReports: ReturnType<typeof vi.fn> };

  // Fix "now" to Wednesday, so the Mon-Sun week window is stable across tests.
  const FIXED_NOW = new Date('2026-07-01T12:00:00Z'); // Wednesday

  const mockUsers = [
    { id: 1, userName: 'Alice Wong', role: { roleName: 'Student' } },
    { id: 2, userName: 'Bob Lee', role: { roleName: 'Student' } },
    { id: 3, userName: 'Ms. Carter', role: { roleName: 'Teacher' } },
  ];

  const mockIncidents = [
    { analysisId: 'i1', studentId: 1, createdAt: '2026-06-29T10:00:00Z', behavior: 'Talking', emotion: 'Neutral' }, // Mon this week
    { analysisId: 'i2', studentId: 2, createdAt: '2026-06-30T10:00:00Z', behavior: 'Talking', emotion: 'Happy' }, // Tue this week
    { analysisId: 'i3', studentId: 1, createdAt: '2026-06-20T10:00:00Z', behavior: 'Sleeping', emotion: 'Sad' }, // last week
  ];

  const mockQuizAnalyses = [
    { studentId: 1, risk_score: 0.8 },
    { studentId: 1, risk_score: 0.6 }, // lower than above; max should be kept
    { studentId: 2, risk_score: 0.5 },
    { studentId: 3, risk_score: 0.9 },
  ];

  const mockQuizzes = [
    { id: 1, title: 'Quiz A', questions: [{ id: 1 }, { id: 2 }] },
    { id: 2, title: 'Quiz B', questions: [] },
  ];

  const mockReports = [
    { id: 1, studentId: 1, riskLevel: 'High', status: 'pending' },
    { id: 2, studentId: 2, riskLevel: 'Medium', status: 'reviewed' },
    { id: 3, studentId: 1, riskLevel: 'Low', status: 'pending' },
  ];

  function configureAndCreate() {
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: IncidentService, useValue: incidentServiceMock },
        { provide: QuizService, useValue: quizServiceMock },
        { provide: ReportService, useValue: reportServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    userServiceMock = { getAllUsers: vi.fn().mockReturnValue(of({ result: mockUsers })) };
    incidentServiceMock = { getAllIncidents: vi.fn().mockReturnValue(of({ result: mockIncidents })) };
    quizServiceMock = {
      getAllQuizAnalyses: vi.fn().mockReturnValue(of({ result: mockQuizAnalyses })),
      getAllQuizzes: vi.fn().mockReturnValue(of({ result: mockQuizzes })),
    };
    reportServiceMock = { getAllReports: vi.fn().mockReturnValue(of({ result: mockReports })) };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    configureAndCreate();
    expect(component).toBeTruthy();
  });

  it('should start in a loading state before data resolves', () => {
    configureAndCreate();
    expect(component.isLoading()).toBe(true);
  });

  it('should set isLoading to false after data loads', () => {
    configureAndCreate();
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });

  describe('after successful load', () => {
    beforeEach(() => {
      configureAndCreate();
      fixture.detectChanges();
    });

    it('should populate users, incidents, quizzes, and reports signals', () => {
      expect(component.users().length).toBe(3);
      expect(component.incidents().length).toBe(3);
      expect(component.quizzes().length).toBe(2);
      expect(component.reports().length).toBe(3);
    });

    it('should compute totalStudents by role, excluding teachers', () => {
      expect(component.totalStudents()).toBe(2);
    });

    it('should count only incidents within the current week', () => {
      expect(component.incidentsThisWeek()).toBe(2);
    });

    it('should compute totalReports and pendingReports', () => {
      expect(component.totalReports()).toBe(3);
      expect(component.pendingReports()).toBe(2);
    });

    it('should build a 7-value incidentsTrend array counting only this-week incidents', () => {
      const trend = component.incidentsTrend();
      expect(trend.length).toBe(7);
      expect(trend.reduce((a, b) => a + b, 0)).toBe(2);
    });

    it('should place this-week incidents on the correct day index (Mon=0..Sun=6)', () => {
      const trend = component.incidentsTrend();
      expect(trend[0]).toBe(1); // Mon
      expect(trend[1]).toBe(1); // Tue
    });

    it('should produce trendLinePoints as a space-separated "x,y" string with 7 points', () => {
      const points = component.trendLinePoints().split(' ');
      expect(points.length).toBe(7);
      points.forEach((p) => expect(p).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/));
    });

    it('should produce trendDots matching the trend counts', () => {
      const dots = component.trendDots();
      expect(dots.length).toBe(7);
      expect(dots[0].value).toBe(1);
      expect(dots[1].value).toBe(1);
      expect(dots[2].value).toBe(0);
    });

    it('should append closing corners to trendAreaPoints', () => {
      const area = component.trendAreaPoints();
      expect(area.endsWith('600,160 0,160')).toBe(true);
    });

    it('should compute 6 descending yAxisLabels ending in 0', () => {
      const labels = component.yAxisLabels();
      expect(labels.length).toBe(6);
      expect(labels[5]).toBe(0);
      expect(labels[0]).toBeGreaterThanOrEqual(labels[1]);
    });

    it('should compute riskDistribution counts and percentages from reports', () => {
      const dist = component.riskDistribution();
      expect(dist.high.count).toBe(1);
      expect(dist.medium.count).toBe(1);
      expect(dist.low.count).toBe(1);
      expect(dist.high.pct).toBe(33);
      expect(dist.medium.pct).toBe(33);
      expect(dist.low.pct).toBe(33);
    });

    it('should build a conic-gradient string from riskDistribution', () => {
      const gradient = component.donutGradient();
      expect(gradient).toContain('conic-gradient');
      expect(gradient).toContain('#dc2626');
      expect(gradient).toContain('#d97706');
      expect(gradient).toContain('#059669');
    });

    it('should compute overallHealth from low/medium/high report counts', () => {
      // total=3, low=1, medium=1 → (1*1 + 1*0.5)/3 = 0.5 → 50%
      expect(component.overallHealth()).toBe(50);
    });

    it('should label health as Moderate for a 50% score', () => {
      expect(component.healthLabel()).toBe('Moderate');
    });

    it('should compute mostDetectedBehavior and averageEmotion via mode', () => {
      // 'Talking' appears twice, 'Sleeping' once
      expect(component.mostDetectedBehavior()).toBe('Talking');
    });

    it('should count distinct students needing attention from high-risk reports', () => {
      // only report id=1 is High risk, studentId=1 → 1 distinct student
      expect(component.studentsNeedingAttention()).toBe(1);
    });

    it('should return the 5 most recent incidents with resolved student names', () => {
      const recent = component.recentIncidents();
      expect(recent.length).toBe(3);
      expect(recent[0].studentName).toBe('Bob Lee'); // i2, 2026-06-30, most recent
      expect(recent[1].studentName).toBe('Alice Wong'); // i1, 2026-06-29
      expect(recent[2].studentName).toBe('Alice Wong'); // i3, 2026-06-20, oldest
    });

    it('should return recentReports with resolved student names, most recent first', () => {
      const recent = component.recentReports();
      expect(recent.length).toBe(3);
      expect(recent[0].studentName).toBeDefined();
    });

    it('should compute topHighRiskStudents using the max risk_score per student, sorted descending', () => {
      const top = component.topHighRiskStudents();
      expect(top.length).toBe(3);
      // student 3 has highest score (0.9), then student 1 (0.8 - max of 0.8/0.6), then student 2 (0.5)
      expect(top[0].studentId).toBe(3);
      expect(top[0].scorePct).toBe(90);
      expect(top[1].studentId).toBe(1);
      expect(top[1].scorePct).toBe(80);
      expect(top[2].studentId).toBe(2);
    });

    it('should assign correct risk level labels based on score thresholds', () => {
      const top = component.topHighRiskStudents();
      const byId = new Map(top.map((s) => [s.studentId, s.level]));
      expect(byId.get(3)).toBe('High'); // 0.9 >= 0.7
      expect(byId.get(1)).toBe('High'); // 0.8 >= 0.7
      expect(byId.get(2)).toBe('Medium'); // 0.5 in [0.4, 0.7)
    });

    it('should compute recentQuizzes with questionCount derived from questions.length', () => {
      const recent = component.recentQuizzes();
      expect(recent.length).toBe(2);
      const quizA = recent.find((q) => q.title === 'Quiz A');
      const quizB = recent.find((q) => q.title === 'Quiz B');
      expect(quizA?.questionCount).toBe(2);
      expect(quizB?.questionCount).toBe(0);
    });
  });

  // Moved out of 'after successful load' — these tests need to reconfigure
  // the TestBed with different mock data, which isn't allowed once the
  // TestBed has already been instantiated by the outer describe's beforeEach.
  describe('recentIncidents edge cases', () => {
    it('should fall back to "Student #<id>" when a user is not found in the map', () => {
      incidentServiceMock.getAllIncidents.mockReturnValue(
        of({ result: [{ analysisId: 'x', studentId: 999, createdAt: '2026-06-29T10:00:00Z', behavior: 'X', emotion: 'Y' }] })
      );
      configureAndCreate();
      fixture.detectChanges();
      const recent = component.recentIncidents();
      expect(recent[0].studentName).toBe('Student #999');
    });
  });

  describe('topHighRiskStudents edge cases', () => {
    it('should limit topHighRiskStudents to 3 entries', () => {
      const manyAnalyses = Array.from({ length: 10 }, (_, i) => ({
        studentId: i + 1,
        risk_score: (i + 1) / 10,
      }));
      quizServiceMock.getAllQuizAnalyses.mockReturnValue(of({ result: manyAnalyses }));
      configureAndCreate();
      fixture.detectChanges();
      expect(component.topHighRiskStudents().length).toBe(3);
    });
  });

  describe('error handling', () => {
    it('should stop loading and log an error if forkJoin fails', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      incidentServiceMock.getAllIncidents.mockReturnValue(throwError(() => new Error('network error')));

      configureAndCreate();
      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Dashboard load error:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('empty data handling', () => {
    beforeEach(() => {
      userServiceMock.getAllUsers.mockReturnValue(of({ result: [] }));
      incidentServiceMock.getAllIncidents.mockReturnValue(of({ result: [] }));
      quizServiceMock.getAllQuizAnalyses.mockReturnValue(of({ result: [] }));
      quizServiceMock.getAllQuizzes.mockReturnValue(of({ result: [] }));
      reportServiceMock.getAllReports.mockReturnValue(of({ result: [] }));
      configureAndCreate();
      fixture.detectChanges();
    });

    it('should default overallHealth to 100 when there are no reports', () => {
      expect(component.overallHealth()).toBe(100);
    });

    it('should label health as Healthy when there is no risk data', () => {
      expect(component.healthLabel()).toBe('Healthy');
    });

    it('should default mostDetectedBehavior and averageEmotion to N/A', () => {
      expect(component.mostDetectedBehavior()).toBe('N/A');
      expect(component.averageEmotion()).toBe('N/A');
    });

    it('should return an empty array for topHighRiskStudents', () => {
      expect(component.topHighRiskStudents()).toEqual([]);
    });

    it('should return 0 for totalStudents, incidentsThisWeek, totalReports, pendingReports', () => {
      expect(component.totalStudents()).toBe(0);
      expect(component.incidentsThisWeek()).toBe(0);
      expect(component.totalReports()).toBe(0);
      expect(component.pendingReports()).toBe(0);
    });

    it('should still produce a 7-point trend line of zeros', () => {
      expect(component.incidentsTrend()).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });
  });

  describe('incidents payload shape fallback', () => {
    it('should handle incidents response nested under .data instead of .result', () => {
      incidentServiceMock.getAllIncidents.mockReturnValue(of({ data: mockIncidents }));
      configureAndCreate();
      fixture.detectChanges();
      expect(component.incidents().length).toBe(3);
    });

    it('should handle incidents response as a raw array (no .result/.data)', () => {
      incidentServiceMock.getAllIncidents.mockReturnValue(of(mockIncidents));
      configureAndCreate();
      fixture.detectChanges();
      expect(component.incidents().length).toBe(3);
    });
  });

  describe('riskBadgeClass / fillClass (unit)', () => {
    beforeEach(() => configureAndCreate());

    it('riskBadgeClass should map high/severe, medium/moderate, and default to low', () => {
      expect(component.riskBadgeClass('high')).toBe('risk-high');
      expect(component.riskBadgeClass('Severe')).toBe('risk-high');
      expect(component.riskBadgeClass('medium')).toBe('risk-medium');
      expect(component.riskBadgeClass('Moderate')).toBe('risk-medium');
      expect(component.riskBadgeClass('low')).toBe('risk-low');
      expect(component.riskBadgeClass(undefined)).toBe('risk-low');
    });

    it('fillClass should map high/severe, medium/moderate, and default to low', () => {
      expect(component.fillClass('high')).toBe('fill-high');
      expect(component.fillClass('Severe')).toBe('fill-high');
      expect(component.fillClass('medium')).toBe('fill-medium');
      expect(component.fillClass('Moderate')).toBe('fill-medium');
      expect(component.fillClass('low')).toBe('fill-low');
      expect(component.fillClass(undefined)).toBe('fill-low');
    });
  });
});
