import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiSchoolHealthCard } from './ai-school-health-card';

describe('AiSchoolHealthCard', () => {
  let component: AiSchoolHealthCard;
  let fixture: ComponentFixture<AiSchoolHealthCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSchoolHealthCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSchoolHealthCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
