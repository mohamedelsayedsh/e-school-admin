import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TopHighRiskStudents } from './top-high-risk-students';

describe('TopHighRiskStudents', () => {
  let component: TopHighRiskStudents;
  let fixture: ComponentFixture<TopHighRiskStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopHighRiskStudents],
    }).compileComponents();

    fixture = TestBed.createComponent(TopHighRiskStudents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
