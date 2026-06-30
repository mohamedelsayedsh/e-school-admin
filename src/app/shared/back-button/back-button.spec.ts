import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { BackButton } from './back-button';

describe('BackButton', () => {
  let component: BackButton;
  let fixture: ComponentFixture<BackButton>;

  function setup(routePath: string, label?: string) {
    fixture = TestBed.createComponent(BackButton);
    fixture.componentRef.setInput('routePath', routePath);
    if (label !== undefined) fixture.componentRef.setInput('label', label);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackButton],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create when routePath is provided', () => {
    setup('/reports');
    expect(component).toBeTruthy();
  });

  it('should default label to "Back" when not provided', () => {
    setup('/reports');
    expect(component.label()).toBe('Back');
  });

  it('should use a custom label when provided', () => {
    setup('/reports', 'Back to Reports');
    expect(component.label()).toBe('Back to Reports');
  });

  it('should render the label text in the button', () => {
    setup('/users', 'Back to Users');
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('button')?.textContent).toContain('Back to Users');
  });

  it('should expose the routePath value the routerLink directive consumes', () => {
    setup('/quizzes');
    expect(component.routePath()).toBe('/quizzes');
  });

  it('should render as a type="button" element so it never submits a parent form', () => {
    setup('/reports');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.type).toBe('button');
  });
});
