import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { QuizzesPreviewList } from './quizzes-preview-list';

describe('QuizzesPreviewList', () => {
  let component: QuizzesPreviewList;
  let fixture: ComponentFixture<QuizzesPreviewList>;

  const mockQuizzes = [
    { id: 1, title: 'Algebra Basics', description: 'Intro to algebra', questionCount: 10 },
    { id: 2, title: 'World War II', description: 'History quiz', questionCount: 15 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesPreviewList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizzesPreviewList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('quizzes', mockQuizzes);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a list row for each quiz', () => {
    fixture.componentRef.setInput('quizzes', mockQuizzes);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('li.list-row');
    expect(rows.length).toBe(2);
  });

  it('should display quiz title, description, and question count', () => {
    fixture.componentRef.setInput('quizzes', mockQuizzes);
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector('li.list-row');
    expect(firstRow.querySelector('.row-title').textContent.trim()).toBe('Algebra Basics');
    expect(firstRow.querySelector('.row-sub').textContent.trim()).toBe('Intro to algebra');
    expect(firstRow.textContent).toContain('10 questions');
  });

  it('should show empty state text when quizzes array is empty', () => {
    fixture.componentRef.setInput('quizzes', []);
    fixture.detectChanges();
    const emptyText = fixture.nativeElement.querySelector('.empty-text');
    expect(emptyText).toBeTruthy();
    expect(emptyText.textContent.trim()).toBe('No quizzes created yet.');
    expect(fixture.nativeElement.querySelectorAll('li.list-row').length).toBe(0);
  });

  it('should not show empty state when quizzes are present', () => {
    fixture.componentRef.setInput('quizzes', mockQuizzes);
    fixture.detectChanges();
    const emptyText = fixture.nativeElement.querySelector('.empty-text');
    expect(emptyText).toBeFalsy();
  });

  it('should render the "View Quizzes" link', () => {
    fixture.componentRef.setInput('quizzes', mockQuizzes);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.view-all');
    expect(link.textContent.trim()).toBe('View Quizzes →');
  });
});
