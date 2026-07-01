import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { RecentReportsList } from './recent-reports-list';

describe('RecentReportsList', () => {
  let component: RecentReportsList;
  let fixture: ComponentFixture<RecentReportsList>;

  const mockReports = [
    { id: 1, studentName: 'Alice Wong', weekNumber: 3, riskLevel: 'High', status: 'Pending' },
    { id: 2, studentName: 'Bob Lee', weekNumber: 4, riskLevel: 'Low', status: 'Reviewed' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentReportsList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentReportsList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('reports', mockReports);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a list row for each report', () => {
    fixture.componentRef.setInput('reports', mockReports);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('li.list-row');
    expect(rows.length).toBe(2);
  });

  it('should display student name, week number, risk level, and status', () => {
    fixture.componentRef.setInput('reports', mockReports);
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector('li.list-row');
    expect(firstRow.querySelector('.row-title').textContent.trim()).toBe('Alice Wong');
    expect(firstRow.querySelector('.row-sub').textContent.trim()).toBe('Week 3');
    expect(firstRow.querySelector('.badge').textContent.trim()).toBe('High');
    expect(firstRow.querySelector('.status-text').textContent.trim()).toBe('Pending');
  });

  it('should render initials avatar from student name', () => {
    fixture.componentRef.setInput('reports', mockReports);
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('.avatar-circle');
    expect(avatar.textContent.trim()).toBe('AL');
  });

  it.each([
    ['High', 'badge-high'],
    ['Severe', 'badge-high'],
    ['Medium', 'badge-medium'],
    ['Moderate', 'badge-medium'],
    ['Low', 'badge-low'],
    [undefined, 'badge-low'],
  ])('should map riskLevel "%s" to class "%s"', (riskLevel, expectedClass) => {
    fixture.componentRef.setInput('reports', [
      { id: 1, studentName: 'Test User', weekNumber: 1, riskLevel, status: 'Pending' },
    ]);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain(expectedClass);
  });

  it('should be case-insensitive when mapping riskLevel to class', () => {
    fixture.componentRef.setInput('reports', [
      { id: 1, studentName: 'Test User', weekNumber: 1, riskLevel: 'HIGH', status: 'Pending' },
    ]);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-high');
  });

  it('should show empty state text when reports array is empty', () => {
    fixture.componentRef.setInput('reports', []);
    fixture.detectChanges();
    const emptyText = fixture.nativeElement.querySelector('.empty-text');
    expect(emptyText).toBeTruthy();
    expect(emptyText.textContent.trim()).toBe('No reports yet.');
  });

  it('should throw when studentName is missing (no defensive check in template)', () => {
    fixture.componentRef.setInput('reports', [
      { id: 1, studentName: undefined, weekNumber: 1, riskLevel: 'Low', status: 'Pending' },
    ]);
    expect(() => fixture.detectChanges()).toThrow();
  });

  describe('riskBadgeClass (unit)', () => {
    it('should return badge-high for "high" and "severe"', () => {
      expect(component.riskBadgeClass('high')).toBe('badge-high');
      expect(component.riskBadgeClass('severe')).toBe('badge-high');
    });

    it('should return badge-medium for "medium" and "moderate"', () => {
      expect(component.riskBadgeClass('medium')).toBe('badge-medium');
      expect(component.riskBadgeClass('moderate')).toBe('badge-medium');
    });

    it('should return badge-low for anything else, including undefined', () => {
      expect(component.riskBadgeClass('low')).toBe('badge-low');
      expect(component.riskBadgeClass(undefined)).toBe('badge-low');
      expect(component.riskBadgeClass('unknown')).toBe('badge-low');
    });
  });
});
