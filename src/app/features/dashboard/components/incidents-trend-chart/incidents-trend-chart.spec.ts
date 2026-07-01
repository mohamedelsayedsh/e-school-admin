import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { IncidentsTrendChart } from './incidents-trend-chart';

describe('IncidentsTrendChart', () => {
  let component: IncidentsTrendChart;
  let fixture: ComponentFixture<IncidentsTrendChart>;

  const setInputs = (overrides: Partial<{
    trendLinePoints: string;
    trendAreaPoints: string;
    trendDots: { x: number; y: number; value: number }[];
    weekDays: string[];
    yAxisLabels: number[];
  }> = {}) => {
    fixture.componentRef.setInput('trendLinePoints', overrides.trendLinePoints ?? '0,10 100,20');
    fixture.componentRef.setInput('trendAreaPoints', overrides.trendAreaPoints ?? '0,10 100,20 100,160 0,160');
    fixture.componentRef.setInput('trendDots', overrides.trendDots ?? [
      { x: 0, y: 10, value: 5 },
      { x: 100, y: 20, value: 3 },
    ]);
    fixture.componentRef.setInput('weekDays', overrides.weekDays ?? ['Mon', 'Tue', 'Wed']);
    fixture.componentRef.setInput('yAxisLabels', overrides.yAxisLabels ?? [0, 5, 10]);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsTrendChart],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentsTrendChart);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setInputs();
    expect(component).toBeTruthy();
  });

  it('should render y-axis labels in order', () => {
    setInputs({ yAxisLabels: [100, 75, 50, 25, 0] });
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.y-axis span')).map(
      (el: any) => el.textContent.trim()
    );
    expect(labels).toEqual(['100', '75', '50', '25', '0']);
  });

  it('should render week day labels', () => {
    setInputs({ weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] });
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.trend-labels span')).map(
      (el: any) => el.textContent.trim()
    );
    expect(labels).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('should render one circle per trend dot', () => {
    setInputs({
      trendDots: [
        { x: 0, y: 10, value: 1 },
        { x: 50, y: 20, value: 2 },
        { x: 100, y: 30, value: 3 },
      ],
    });
    const circles = fixture.nativeElement.querySelectorAll('circle.trend-dot');
    expect(circles.length).toBe(3);
  });

  it('should bind dot cx/cy attributes correctly', () => {
    setInputs({ trendDots: [{ x: 42, y: 99, value: 7 }] });
    const circle = fixture.nativeElement.querySelector('circle.trend-dot');
    expect(circle.getAttribute('cx')).toBe('42');
    expect(circle.getAttribute('cy')).toBe('99');
  });

  it('should bind trendLinePoints to the polyline', () => {
    setInputs({ trendLinePoints: '1,2 3,4 5,6' });
    const polyline = fixture.nativeElement.querySelector('polyline.trend-line');
    expect(polyline.getAttribute('points')).toBe('1,2 3,4 5,6');
  });

  it('should bind trendAreaPoints to the polygon', () => {
    setInputs({ trendAreaPoints: '0,0 10,10 10,0' });
    const polygon = fixture.nativeElement.querySelector('polygon.trend-area');
    expect(polygon.getAttribute('points')).toBe('0,0 10,10 10,0');
  });

  it('should render no dots when trendDots is empty', () => {
    setInputs({ trendDots: [] });
    const circles = fixture.nativeElement.querySelectorAll('circle.trend-dot');
    expect(circles.length).toBe(0);
  });

  it('should throw if required inputs are not set before detectChanges', () => {
    expect(() => fixture.detectChanges()).toThrow();
  });
});
