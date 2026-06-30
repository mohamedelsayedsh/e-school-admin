import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IncidentsTrendChart } from './incidents-trend-chart';

describe('IncidentsTrendChart', () => {
  let component: IncidentsTrendChart;
  let fixture: ComponentFixture<IncidentsTrendChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsTrendChart],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentsTrendChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
