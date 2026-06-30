import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizzesPreviewList } from './quizzes-preview-list';

describe('QuizzesPreviewList', () => {
  let component: QuizzesPreviewList;
  let fixture: ComponentFixture<QuizzesPreviewList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesPreviewList],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizzesPreviewList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
