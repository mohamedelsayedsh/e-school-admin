import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { RecentIncidentsList } from './recent-incidents-list';

describe('RecentIncidentsList', () => {
  let component: RecentIncidentsList;
  let fixture: ComponentFixture<RecentIncidentsList>;

  const mockIncidents = [
    { analysisId: 'a1', studentName: 'John Doe', behavior: 'Talking', behaviorConfidence: 0.85 },
    { analysisId: 'a2', studentName: 'Jane Smith', behavior: 'Sleeping', behaviorConfidence: 0.5 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentIncidentsList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentIncidentsList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('incidents', mockIncidents);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a list row for each incident', () => {
    fixture.componentRef.setInput('incidents', mockIncidents);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('li.list-row');
    expect(rows.length).toBe(2);
  });

  it('should display student name and behavior', () => {
    fixture.componentRef.setInput('incidents', mockIncidents);
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector('li.list-row');
    expect(firstRow.querySelector('.row-title').textContent.trim()).toBe('John Doe');
    expect(firstRow.querySelector('.row-sub').textContent.trim()).toBe('Talking');
  });

  it('should render initials avatar from student name', () => {
    fixture.componentRef.setInput('incidents', mockIncidents);
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('.avatar-circle');
    expect(avatar.textContent.trim()).toBe('JO');
  });

  it('should format confidence as a rounded percentage', () => {
    fixture.componentRef.setInput('incidents', mockIncidents);
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('.badge');
    expect(badges[0].textContent.trim()).toBe('85%');
    expect(badges[1].textContent.trim()).toBe('50%');
  });

  it('should apply badge-high class when confidence > 0.7', () => {
    fixture.componentRef.setInput('incidents', mockIncidents);
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('.badge');
    expect(badges[0].classList).toContain('badge-high');
  });

  it('should apply badge-medium class when confidence <= 0.7', () => {
    fixture.componentRef.setInput('incidents', mockIncidents);
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('.badge');
    expect(badges[1].classList).toContain('badge-medium');
  });

  it('should treat exactly 0.7 confidence as medium (boundary check)', () => {
    fixture.componentRef.setInput('incidents', [
      { analysisId: 'a3', studentName: 'Boundary Case', behavior: 'Idle', behaviorConfidence: 0.7 },
    ]);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-medium');
    expect(badge.classList).not.toContain('badge-high');
  });

  it('should show empty state text when incidents array is empty', () => {
    fixture.componentRef.setInput('incidents', []);
    fixture.detectChanges();
    const emptyText = fixture.nativeElement.querySelector('.empty-text');
    expect(emptyText).toBeTruthy();
    expect(emptyText.textContent.trim()).toBe('No incidents yet.');
  });

  it('should throw when studentName is missing (no defensive check in template)', () => {
    fixture.componentRef.setInput('incidents', [
      { analysisId: 'a4', studentName: undefined, behavior: 'Talking', behaviorConfidence: 0.9 },
    ]);
    expect(() => fixture.detectChanges()).toThrow();
  });

});
