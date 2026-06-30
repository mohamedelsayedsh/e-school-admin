import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { ViewQuiz } from './view-quiz';
import { Quiz } from '../../../core/models/quiz';

describe('ViewQuiz', () => {
  let component: ViewQuiz;
  let fixture: ComponentFixture<ViewQuiz>;

  const quizWithQuestions: Quiz = {
    id: 1,
    title: 'Behavior Quiz',
    description: 'Tracks student behavior',
    questions: [
      { id: 1, text: 'Is the student sleeping?', order: 1, options: [{ text: 'Yes', value: '1' }, { text: 'No', value: '0' }] },
      { id: 2, text: 'Is the student writing?', order: 2, options: [{ text: 'Yes', value: '1' }, { text: 'No', value: '0' }] },
    ],
  };

  const quizWithoutQuestions: Quiz = {
    id: 2,
    title: 'Empty Quiz',
    description: 'No questions yet',
  };

  function setup(quiz: Quiz) {
    fixture = TestBed.createComponent(ViewQuiz);
    fixture.componentRef.setInput('quiz', quiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQuiz],
    }).compileComponents();
  });

  it('should create', () => {
    setup(quizWithQuestions);
    expect(component).toBeTruthy();
  });

  it('should render the quiz title and description', () => {
    setup(quizWithQuestions);
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.querySelector('h4')?.textContent).toContain('Behavior Quiz');
    expect(compiled.querySelector('.text-muted')?.textContent).toContain('Tracks student behavior');
  });

  it('should render one question block per question', () => {
    setup(quizWithQuestions);
    const compiled: HTMLElement = fixture.nativeElement;

    const blocks = compiled.querySelectorAll('.question-block');
    expect(blocks.length).toBe(2);
    expect(blocks[0].textContent).toContain('Is the student sleeping?');
    expect(blocks[1].textContent).toContain('Is the student writing?');
  });

  it('should render each question\'s options as list items', () => {
    setup(quizWithQuestions);
    const compiled: HTMLElement = fixture.nativeElement;

    const firstBlockOptions = compiled.querySelectorAll('.question-block')[0].querySelectorAll('li');
    expect(firstBlockOptions.length).toBe(2);
    expect(firstBlockOptions[0].textContent).toContain('Yes');
    expect(firstBlockOptions[1].textContent).toContain('No');
  });

  it('should show the empty-state message when questions is undefined', () => {
    setup(quizWithoutQuestions);
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('No questions added to this quiz yet.');
    expect(compiled.querySelectorAll('.question-block').length).toBe(0);
  });

  it('should show the empty-state message when questions is an empty array', () => {
    setup({ ...quizWithoutQuestions, questions: [] });
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('No questions added to this quiz yet.');
  });

  it('should emit closeModal when the header close button is clicked', () => {
    setup(quizWithQuestions);
    let emitted = false;
    component.closeModal.subscribe(() => (emitted = true));

    const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-close-icon');
    closeBtn.click();

    expect(emitted).toBe(true);
  });

  it('should emit closeModal when the footer Close button is clicked', () => {
    setup(quizWithQuestions);
    let emitted = false;
    component.closeModal.subscribe(() => (emitted = true));

    const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-cancel');
    closeBtn.click();

    expect(emitted).toBe(true);
  });
});
