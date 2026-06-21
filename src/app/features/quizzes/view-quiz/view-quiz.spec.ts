import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuiz } from './view-quiz';

describe('ViewQuiz', () => {
  let component: ViewQuiz;
  let fixture: ComponentFixture<ViewQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQuiz],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewQuiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
