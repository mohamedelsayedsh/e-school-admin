import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizzesList } from './quizzes-list';

describe('QuizzesList', () => {
  let component: QuizzesList;
  let fixture: ComponentFixture<QuizzesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesList],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizzesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
