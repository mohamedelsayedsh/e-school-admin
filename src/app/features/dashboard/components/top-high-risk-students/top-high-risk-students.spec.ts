import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { TopHighRiskStudents } from './top-high-risk-students';

describe('TopHighRiskStudents', () => {
  let component: TopHighRiskStudents;
  let fixture: ComponentFixture<TopHighRiskStudents>;

  const mockStudents = [
    { studentId: 1, studentName: 'Alice Wong', scorePct: 85, level: 'High' },
    { studentId: 2, studentName: 'Bob Lee', scorePct: 55, level: 'Medium' },
    { studentId: 3, studentName: 'Cara Kim', scorePct: 20, level: 'Low' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopHighRiskStudents],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TopHighRiskStudents);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('students', mockStudents);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a row for each student', () => {
    fixture.componentRef.setInput('students', mockStudents);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('li.list-row');
    expect(rows.length).toBe(3);
  });

  it('should display student name, score, and level', () => {
    fixture.componentRef.setInput('students', mockStudents);
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector('li.list-row');
    expect(firstRow.querySelector('.row-title').textContent.trim()).toBe('Alice Wong');
    expect(firstRow.querySelector('.row-sub').textContent.trim()).toBe('Risk Score: 85%');
    expect(firstRow.querySelector('.badge').textContent.trim()).toBe('High');
  });

  it('should set progress bar width equal to scorePct', () => {
    fixture.componentRef.setInput('students', mockStudents);
    fixture.detectChanges();
    const fills = fixture.nativeElement.querySelectorAll('.progress-bar-fill');
    expect(fills[0].style.width).toBe('85%');
    expect(fills[1].style.width).toBe('55%');
    expect(fills[2].style.width).toBe('20%');
  });

  it('should apply matching fill class based on risk level', () => {
    fixture.componentRef.setInput('students', mockStudents);
    fixture.detectChanges();
    const fills = fixture.nativeElement.querySelectorAll('.progress-bar-fill');
    expect(fills[0].classList).toContain('badge-high-fill');
    expect(fills[1].classList).toContain('badge-medium-fill');
    expect(fills[2].classList).toContain('badge-low-fill');
  });

  it('should show empty state when there is no quiz data', () => {
    fixture.componentRef.setInput('students', []);
    fixture.detectChanges();
    const emptyText = fixture.nativeElement.querySelector('.empty-text');
    expect(emptyText).toBeTruthy();
    expect(emptyText.textContent.trim()).toBe('No quiz data yet.');
  });

  describe('riskBadgeClass (unit)', () => {
    it('should map high/severe to badge-high', () => {
      expect(component.riskBadgeClass('high')).toBe('badge-high');
      expect(component.riskBadgeClass('Severe')).toBe('badge-high');
    });

    it('should map medium/moderate to badge-medium', () => {
      expect(component.riskBadgeClass('medium')).toBe('badge-medium');
      expect(component.riskBadgeClass('Moderate')).toBe('badge-medium');
    });

    it('should default to badge-low', () => {
      expect(component.riskBadgeClass('low')).toBe('badge-low');
      expect(component.riskBadgeClass(undefined)).toBe('badge-low');
    });
  });
});
