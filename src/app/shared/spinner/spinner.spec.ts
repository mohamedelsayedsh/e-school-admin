import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { Spinner } from './spinner';

describe('Spinner', () => {
  let component: Spinner;
  let fixture: ComponentFixture<Spinner>;

  function setup(overrides: { fullPage?: boolean; message?: string } = {}) {
    fixture = TestBed.createComponent(Spinner);
    if (overrides.fullPage !== undefined) fixture.componentRef.setInput('fullPage', overrides.fullPage);
    if (overrides.message !== undefined) fixture.componentRef.setInput('message', overrides.message);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spinner],
    }).compileComponents();
  });

  it('should create with all defaults', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should default fullPage to false', () => {
    setup();
    expect(component.fullPage()).toBe(false);
  });

  it('should default message to "Loading..."', () => {
    setup();
    expect(component.message()).toBe('Loading...');
  });

  it('should render the default message text', () => {
    setup();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('.spinner-message')?.textContent).toContain('Loading...');
  });

  it('should render a custom message when provided', () => {
    setup({ message: 'Fetching reports...' });
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('.spinner-message')?.textContent).toContain('Fetching reports...');
  });

  it('should NOT render the message element when message is set to an empty string', () => {
    setup({ message: '' });
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('.spinner-message')).toBeNull();
  });

  it('should NOT apply the spinner-fullpage class when fullPage is false', () => {
    setup({ fullPage: false });
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.spinner-wrapper');
    expect(wrapper.classList.contains('spinner-fullpage')).toBe(false);
  });

  it('should apply the spinner-fullpage class when fullPage is true', () => {
    setup({ fullPage: true });
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.spinner-wrapper');
    expect(wrapper.classList.contains('spinner-fullpage')).toBe(true);
  });

  it('should always render the spinner ring regardless of message/fullPage state', () => {
    setup({ message: '', fullPage: false });
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('.spinner-ring')).not.toBeNull();
  });
});
