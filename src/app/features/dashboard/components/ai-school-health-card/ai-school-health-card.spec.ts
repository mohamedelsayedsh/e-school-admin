import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AiSchoolHealthCard } from './ai-school-health-card';

describe('AiSchoolHealthCard', () => {
  let component: AiSchoolHealthCard;
  let fixture: ComponentFixture<AiSchoolHealthCard>;

  const setInputs = (overrides: Partial<{
    overallHealth: number;
    healthLabel: string;
    averageEmotion: string;
    mostDetectedBehavior: string;
    studentsNeedingAttention: number;
  }> = {}) => {
    fixture.componentRef.setInput('overallHealth', overrides.overallHealth ?? 82);
    fixture.componentRef.setInput('healthLabel', overrides.healthLabel ?? 'Good');
    fixture.componentRef.setInput('averageEmotion', overrides.averageEmotion ?? 'Happy');
    fixture.componentRef.setInput('mostDetectedBehavior', overrides.mostDetectedBehavior ?? 'Talking');
    fixture.componentRef.setInput('studentsNeedingAttention', overrides.studentsNeedingAttention ?? 3);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSchoolHealthCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSchoolHealthCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setInputs();
    expect(component).toBeTruthy();
  });

  it('should display the overall health percentage', () => {
    setInputs({ overallHealth: 76 });
    const ringInner = fixture.nativeElement.querySelector('.health-ring-inner');
    expect(ringInner.textContent.trim()).toBe('76%');
  });

  it('should display the health label and status text separately', () => {
    setInputs({ healthLabel: 'Needs Attention' });
    const status = fixture.nativeElement.querySelector('.health-status');
    expect(status.textContent.trim()).toBe('Needs Attention');
  });

  it('should display average emotion, most detected behavior, and students needing attention', () => {
    setInputs({
      averageEmotion: 'Calm',
      mostDetectedBehavior: 'Sleeping',
      studentsNeedingAttention: 5,
    });
    const rows = fixture.nativeElement.querySelectorAll('.health-stat-row strong');
    expect(rows[0].textContent.trim()).toBe('Calm');
    expect(rows[1].textContent.trim()).toBe('Sleeping');
    expect(rows[2].textContent.trim()).toBe('5');
  });

  it('should set the conic-gradient background proportional to overallHealth', () => {
  setInputs({ overallHealth: 40 });
  const ring = fixture.nativeElement.querySelector('.health-ring');
  expect(ring.style.background).toContain('40%');
  expect(ring.style.background).toContain('conic-gradient');
  expect(ring.style.background).toContain('rgb(34, 197, 94)');   // #22c55e
  expect(ring.style.background).toContain('rgb(229, 231, 235)'); // #e5e7eb
});

  it('should handle 0% health without breaking the ring', () => {
    setInputs({ overallHealth: 0 });
    const ringInner = fixture.nativeElement.querySelector('.health-ring-inner');
    expect(ringInner.textContent.trim()).toBe('0%');
  });

  it('should handle 100% health', () => {
    setInputs({ overallHealth: 100 });
    const ringInner = fixture.nativeElement.querySelector('.health-ring-inner');
    expect(ringInner.textContent.trim()).toBe('100%');
  });
});
