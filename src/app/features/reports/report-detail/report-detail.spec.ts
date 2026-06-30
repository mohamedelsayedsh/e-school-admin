import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ReportDetail } from './report-detail';
import { ReportService } from '../../../core/services/report';
import { UserService } from '../../../core/services/user';
import { ReportInterface } from '../../../core/models/report';
import { User } from '../../../core/models/user';

describe('ReportDetail', () => {
  let component: ReportDetail;
  let fixture: ComponentFixture<ReportDetail>;
  let reportServiceSpy: { getReportById: ReturnType<typeof vi.fn> };
  let userServiceSpy: { getUserById: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let routeParamId: string | null;

  const mockReport: ReportInterface = {
    id: 5, studentId: 10, weekNumber: 3, totalImages: 100,
    sleepingCount: 2, lookingBackCount: 4, handRaisedCount: 8,
    writtingCount: 6, readingCount: 10, standingCount: 1, lookingForwardCount: 12,
    avgConfidence: 0.85, riskLevel: 'Medium', status: 'Pending', recomendation: 'Keep monitoring',
  };

  const mockStudent: User = {
    id: 10, userName: 'Ahmed', email: 'a@test.com', phoneNumber: '0100', roleID: 3,
  };

  function setup() {
    fixture = TestBed.createComponent(ReportDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  async function configure() {
    await TestBed.configureTestingModule({
      imports: [ReportDetail],
      providers: [
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: routeParamId ?? undefined }) },
          },
        },
      ],
    }).compileComponents();
  }

  beforeEach(() => {
    reportServiceSpy = { getReportById: vi.fn() };
    userServiceSpy = { getUserById: vi.fn() };
    routerSpy = { navigate: vi.fn() };
    routeParamId = '5';

    reportServiceSpy.getReportById.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockReport })
    );
    userServiceSpy.getUserById.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockStudent })
    );
  });

  it('should create and load a report when result is a single object', async () => {
    await configure();
    setup();

    expect(component.report()).toEqual(mockReport);
    expect(component.student()).toEqual(mockStudent);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('should unwrap the first element when result is an array', async () => {
    reportServiceSpy.getReportById.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: [mockReport] })
    );
    await configure();
    setup();

    expect(component.report()).toEqual(mockReport);
  });

  it('should show "Report not found." when result is an empty array', async () => {
    reportServiceSpy.getReportById.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] })
    );
    await configure();
    setup();

    expect(component.report()).toBeNull();
    expect(component.errorMessage()).toBe('Report not found.');
    expect(component.isLoading()).toBe(false);
    // Student fetch should never have been attempted with no report
    expect(userServiceSpy.getUserById).not.toHaveBeenCalled();
  });

  it('should show "Invalid report ID." and never call the API when the id param is missing', async () => {
    routeParamId = null;
    await configure();
    setup();

    expect(component.errorMessage()).toBe('Invalid report ID.');
    expect(component.isLoading()).toBe(false);
    expect(reportServiceSpy.getReportById).not.toHaveBeenCalled();
  });

  it('should show "Invalid report ID." when the id param is "0" (falsy)', async () => {
    routeParamId = '0';
    await configure();
    setup();

    expect(component.errorMessage()).toBe('Invalid report ID.');
    expect(reportServiceSpy.getReportById).not.toHaveBeenCalled();
  });

  it('should use the backend errorMessages when isSuccess is false', async () => {
    reportServiceSpy.getReportById.mockReturnValue(
      of({ isSuccess: false, statusCode: 404, errorMessages: ['No such report'], result: null })
    );
    await configure();
    setup();

    expect(component.errorMessage()).toBe('No such report');
    expect(component.isLoading()).toBe(false);
  });

  it('should fall back to a generic message when isSuccess is false with no errorMessages', async () => {
    reportServiceSpy.getReportById.mockReturnValue(
      of({ isSuccess: false, statusCode: 404, errorMessages: [], result: null })
    );
    await configure();
    setup();

    expect(component.errorMessage()).toBe('Failed to load report.');
  });

  it('should set a connection error message when the report request itself errors out', async () => {
    reportServiceSpy.getReportById.mockReturnValue(throwError(() => new Error('network down')));
    await configure();
    setup();

    expect(component.errorMessage()).toBe('Connection error. Please try again.');
    expect(component.isLoading()).toBe(false);
  });

  it('should still finish loading (and keep the report) even if fetching the student fails', async () => {
    userServiceSpy.getUserById.mockReturnValue(throwError(() => new Error('user lookup failed')));
    await configure();
    setup();

    expect(component.report()).toEqual(mockReport);
    expect(component.student()).toBeNull();
    expect(component.isLoading()).toBe(false);
  });

  it('should not set student when the user lookup reports isSuccess: false', async () => {
    userServiceSpy.getUserById.mockReturnValue(
      of({ isSuccess: false, statusCode: 404, errorMessages: [], result: null })
    );
    await configure();
    setup();

    expect(component.student()).toBeNull();
    expect(component.isLoading()).toBe(false);
  });

  describe('getPercent', () => {
    it('should compute percentages relative to the largest behavior count in the report', async () => {
      await configure();
      setup();

      // mockReport's max behavior count is lookingForwardCount = 12
      expect(component.getPercent(12)).toBe(100);
      expect(component.getPercent(6)).toBe(50);
      expect(component.getPercent(0)).toBe(0);
    });

    it('should never divide by zero — falls back to a max of 1 when all counts are 0', async () => {
      const zeroReport: ReportInterface = { ...mockReport, sleepingCount: 0, lookingBackCount: 0, handRaisedCount: 0, writtingCount: 0, readingCount: 0, standingCount: 0, lookingForwardCount: 0 };
      reportServiceSpy.getReportById.mockReturnValue(
        of({ isSuccess: true, statusCode: 200, errorMessages: [], result: zeroReport })
      );
      await configure();
      setup();

      expect(component.getPercent(0)).toBe(0);
      expect(() => component.getPercent(0)).not.toThrow();
    });
  });

  describe('navigation', () => {
    it('goToStudent should navigate to /users/:id when a student is loaded', async () => {
      await configure();
      setup();

      component.goToStudent();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', 10]);
    });

    it('goToStudent should do nothing when no student is loaded', async () => {
      userServiceSpy.getUserById.mockReturnValue(
        of({ isSuccess: false, statusCode: 404, errorMessages: [], result: null })
      );
      await configure();
      setup();

      component.goToStudent();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('goBack should navigate to /reports', async () => {
      await configure();
      setup();

      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/reports']);
    });
  });

  describe('isEditModalOpen', () => {
    it('should default to closed', async () => {
      await configure();
      setup();

      expect(component.isEditModalOpen()).toBe(false);
    });

    it('should be settable independently of the report-loading flow', async () => {
      await configure();
      setup();

      component.isEditModalOpen.set(true);
      expect(component.isEditModalOpen()).toBe(true);

      component.isEditModalOpen.set(false);
      expect(component.isEditModalOpen()).toBe(false);
    });
  });

  it('fetchReportDetails should reset student, error, and loading state on every call (e.g. after an edit)', async () => {
    await configure();
    setup();

    // simulate a stale error from a previous failed load
    component.errorMessage.set('stale error');

    component.fetchReportDetails();

    // isLoading is set back to true synchronously at the start of the refetch...
    // and since our mocked observable resolves synchronously, by the time we check here
    // it has already completed — so we instead assert the *end* state is clean.
    expect(component.errorMessage()).toBe('');
    expect(component.report()).toEqual(mockReport);
  });
});
