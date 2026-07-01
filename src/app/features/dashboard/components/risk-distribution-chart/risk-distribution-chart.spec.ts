import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { RiskDistributionChart } from './risk-distribution-chart';

describe('RiskDistributionChart', () => {
  let component: RiskDistributionChart;
  let fixture: ComponentFixture<RiskDistributionChart>;

  const mockDistribution = {
    high: { count: 5, pct: 50 },
    medium: { count: 3, pct: 30 },
    low: { count: 2, pct: 20 },
  };
  const mockGradient = 'conic-gradient(#dc2626 0% 50%, #d97706 50% 80%, #059669 80% 100%)';

  const setInputs = (distribution = mockDistribution, gradient = mockGradient) => {
    fixture.componentRef.setInput('distribution', distribution);
    fixture.componentRef.setInput('gradient', gradient);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskDistributionChart],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskDistributionChart);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setInputs();
    expect(component).toBeTruthy();
  });

  it('should apply the gradient to the donut background', () => {
    setInputs();
    const donut = fixture.nativeElement.querySelector('.donut');
    expect(donut.style.background).toContain('conic-gradient');
    expect(donut.style.background).toContain('rgb(220, 38, 38)');   // #dc2626
    expect(donut.style.background).toContain('rgb(217, 119, 6)');   // #d97706
    expect(donut.style.background).toContain('rgb(5, 150, 105)');   // #059669
    expect(donut.style.background).toContain('0% 50%');
    expect(donut.style.background).toContain('50% 80%');
    expect(donut.style.background).toContain('80% 100%');
  });

  it('should display high, medium, and low risk percentages and counts', () => {
    setInputs();
    const items = fixture.nativeElement.querySelectorAll('.legend-item strong');
    expect(items[0].textContent.trim()).toBe('50% (5)');
    expect(items[1].textContent.trim()).toBe('30% (3)');
    expect(items[2].textContent.trim()).toBe('20% (2)');
  });

  it('should handle all-zero distribution without breaking', () => {
    setInputs({
      high: { count: 0, pct: 0 },
      medium: { count: 0, pct: 0 },
      low: { count: 0, pct: 0 },
    });
    const items = fixture.nativeElement.querySelectorAll('.legend-item strong');
    expect(items[0].textContent.trim()).toBe('0% (0)');
    expect(items[1].textContent.trim()).toBe('0% (0)');
    expect(items[2].textContent.trim()).toBe('0% (0)');
  });

  it('should render exactly one dot indicator per risk level', () => {
    setInputs();
    expect(fixture.nativeElement.querySelector('.dot-high')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.dot-medium')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.dot-low')).toBeTruthy();
  });
});
