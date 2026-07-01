import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  let component: StatCard;
  let fixture: ComponentFixture<StatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCard);
    component = fixture.componentInstance;
  });

  const setInputs = (overrides: Partial<{
    icon: string; color: string; label: string; value: number; subLabel: string; subClass: string;
  }> = {}) => {
    fixture.componentRef.setInput('icon', overrides.icon ?? 'bi-people-fill');
    fixture.componentRef.setInput('color', overrides.color ?? 'blue');
    fixture.componentRef.setInput('label', overrides.label ?? 'Total Students');
    fixture.componentRef.setInput('value', overrides.value ?? 120);
    if (overrides.subLabel !== undefined) fixture.componentRef.setInput('subLabel', overrides.subLabel);
    if (overrides.subClass !== undefined) fixture.componentRef.setInput('subClass', overrides.subClass);
    fixture.detectChanges();
  };

  it('should create', () => {
    setInputs();
    expect(component).toBeTruthy();
  });

  it('should display label and value', () => {
    setInputs({ label: 'Incidents (This Week)', value: 7 });
    expect(fixture.nativeElement.querySelector('.stat-label').textContent.trim()).toBe('Incidents (This Week)');
    expect(fixture.nativeElement.querySelector('.stat-value').textContent.trim()).toBe('7');
  });

  it('should apply the correct icon color class', () => {
    setInputs({ color: 'red' });
    const iconWrap = fixture.nativeElement.querySelector('.stat-icon');
    expect(iconWrap.classList).toContain('icon-red');
  });

  it('should apply the bootstrap icon class', () => {
    setInputs({ icon: 'bi-shield-exclamation' });
    const icon = fixture.nativeElement.querySelector('.stat-icon i');
    expect(icon.classList).toContain('bi-shield-exclamation');
  });

  it('should not render sub-label section when subLabel is not provided', () => {
    setInputs();
    const sub = fixture.nativeElement.querySelector('.stat-sub');
    expect(sub).toBeFalsy();
  });

  it('should render sub-label and subClass when provided', () => {
    setInputs({ subLabel: '3 Pending', subClass: 'pending' });
    const sub = fixture.nativeElement.querySelector('.stat-sub');
    expect(sub).toBeTruthy();
    expect(sub.textContent.trim()).toBe('3 Pending');
    expect(sub.classList).toContain('pending');
  });

  it('should not render sub-label when subLabel is an empty string (falsy)', () => {
    setInputs({ subLabel: '' });
    const sub = fixture.nativeElement.querySelector('.stat-sub');
    expect(sub).toBeFalsy();
  });

  it('should render a value of 0 correctly (not treated as falsy/empty)', () => {
    setInputs({ value: 0 });
    expect(fixture.nativeElement.querySelector('.stat-value').textContent.trim()).toBe('0');
  });
});
