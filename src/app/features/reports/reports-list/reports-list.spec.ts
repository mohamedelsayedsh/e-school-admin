import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ReportsList } from './reports-list';
import { ReportService } from '../../../core/services/report';
import { UserService } from '../../../core/services/user';
import { ReportInterface } from '../../../core/models/report';

describe('ReportsList', () => {
  let component: ReportsList;
  let fixture: ComponentFixture<ReportsList>;
  let reportServiceSpy: { getAllReports: ReturnType<typeof vi.fn> };
  let userServiceSpy: { getAllUsers: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  const mockReports: ReportInterface[] = [
    { id: 1, studentId: 10, weekNumber: 1, totalImages: 100, sleepingCount: 1, lookingBackCount: 1, handRaisedCount: 1, writtingCount: 1, readingCount: 1, standingCount: 1, lookingForwardCount: 1, avgConfidence: 0.9, riskLevel: 'High', status: 'Pending', recomendation: 'r1' },
    { id: 2, studentId: 11, weekNumber: 2, totalImages: 80, sleepingCount: 0, lookingBackCount: 0, handRaisedCount: 5, writtingCount: 5, readingCount: 5, standingCount: 0, lookingForwardCount: 5, avgConfidence: 0.7, riskLevel: 'Medium', status: 'Approved', recomendation: 'r2' },
    { id: 3, studentId: 10, weekNumber: 2, totalImages: 60, sleepingCount: 0, lookingBackCount: 0, handRaisedCount: 3, writtingCount: 3, readingCount: 3, standingCount: 0, lookingForwardCount: 3, avgConfidence: 0.95, riskLevel: 'Low', status: 'Approved', recomendation: 'r3' },
  ];

  function setup() {
    fixture = TestBed.createComponent(ReportsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    reportServiceSpy = { getAllReports: vi.fn() };
    userServiceSpy = { getAllUsers: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    reportServiceSpy.getAllReports.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockReports })
    );
    userServiceSpy.getAllUsers.mockReturnValue(
      of({
        isSuccess: true, statusCode: 200, errorMessages: [],
        result: [{ id: 10, userName: 'Ahmed' }, { id: 11, userName: 'Osama' }],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReportsList],
      providers: [
        provideRouter([]),
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    setup();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reports and mirror them into filteredReports on success', () => {
    expect(component.reports()).toEqual(mockReports);
    expect(component.filteredReports()).toEqual(mockReports);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('should call getAllUsers exactly ONCE to resolve student names (no N+1 per-student calls)', () => {
    expect(userServiceSpy.getAllUsers).toHaveBeenCalledTimes(1);
    expect(component.getStudentName(10)).toBe('Ahmed');
    expect(component.getStudentName(11)).toBe('Osama');
  });

  it('getStudentName should fall back to "Student #id" for an unmapped id', () => {
    expect(component.getStudentName(999)).toBe('Student #999');
  });

  it('should set errorMessage and stop loading when the backend reports failure', () => {
    reportServiceSpy.getAllReports.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: [], result: null })
    );
    setup();

    expect(component.errorMessage()).toBe('Failed to load reports.');
    expect(component.isLoading()).toBe(false);
    expect(component.reports()).toEqual([]);
  });

  it('should set a connection error message when getAllReports errors out', () => {
    reportServiceSpy.getAllReports.mockReturnValue(throwError(() => new Error('network down')));
    setup();

    expect(component.errorMessage()).toBe('Connection error. Please try again later.');
    expect(component.isLoading()).toBe(false);
  });

  it('should still render reports even if the student-name lookup fails', () => {
    userServiceSpy.getAllUsers.mockReturnValue(throwError(() => new Error('users down')));
    setup();

    expect(component.reports()).toEqual(mockReports);
    expect(component.getStudentName(10)).toBe('Student #10'); // falls back, no crash
  });

  it('availableWeeks should return unique weeks sorted ascending', () => {
    expect(component.availableWeeks).toEqual([1, 2]);
  });

  it('applyFilters with no filters set should return all reports', () => {
    component.filterWeek = '';
    component.filterRisk = '';
    component.filterStatus = '';
    component.applyFilters();

    expect(component.filteredReports()).toEqual(mockReports);
  });

  it('applyFilters by week only should return matching reports', () => {
    component.filterWeek = '2';
    component.applyFilters();

    expect(component.filteredReports().map(r => r.id)).toEqual([2, 3]);
  });

  it('applyFilters by risk only should return matching reports', () => {
    component.filterRisk = 'High';
    component.applyFilters();

    expect(component.filteredReports().map(r => r.id)).toEqual([1]);
  });

  it('applyFilters by status only should return matching reports', () => {
    component.filterStatus = 'Approved';
    component.applyFilters();

    expect(component.filteredReports().map(r => r.id)).toEqual([2, 3]);
  });

  it('applyFilters should AND multiple filters together, not OR', () => {
    component.filterWeek = '2';
    component.filterStatus = 'Approved';
    component.applyFilters();

    // Week 2 AND Approved -> ids 2 and 3 both qualify
    expect(component.filteredReports().map(r => r.id)).toEqual([2, 3]);

    component.filterRisk = 'Low';
    component.applyFilters();

    // Week 2 AND Approved AND Low risk -> only id 3
    expect(component.filteredReports().map(r => r.id)).toEqual([3]);
  });

  it('applyFilters with a combination matching nothing should return an empty list', () => {
    component.filterWeek = '1';
    component.filterStatus = 'Approved'; // report 1 (week 1) is Pending, not Approved
    component.applyFilters();

    expect(component.filteredReports()).toEqual([]);
  });

  it('applyFilters should not mutate the original reports() array', () => {
    const originalLength = component.reports().length;
    component.filterRisk = 'High';
    component.applyFilters();

    expect(component.reports().length).toBe(originalLength);
  });

  it('viewReportDetails should navigate to /reports/:id with the value passed in', () => {
    component.viewReportDetails(42);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/reports', 42]);
  });

  it('⚠ KNOWN ISSUE: the template currently calls viewReportDetails(report.studentId) instead of report.id', () => {
    // This test documents the CURRENT behavior of reports-list.html, not necessarily the
    // CORRECT behavior. The "View" eye icon passes report.studentId, but ReportDetail's
    // route (/reports/:id) and ReportService.getReportById(id) both expect the REPORT id,
    // not the student id. For a student with multiple reports, studentId !== report.id,
    // so clicking "View" likely opens the wrong report (or a report belonging to a
    // different student whose id happens to match this studentId).
    // Flagging here rather than silently fixing it, since changing the template argument
    // from report.studentId to report.id is a behavior change that needs confirmation.
    const reportWithMismatchedIds = mockReports[2]; // id: 3, studentId: 10
    expect(reportWithMismatchedIds.id).not.toBe(reportWithMismatchedIds.studentId);
  });
});
