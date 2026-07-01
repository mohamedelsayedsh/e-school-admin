import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { BackButton } from './back-button';

describe('BackButton', () => {
  let component: BackButton;
  let fixture: ComponentFixture<BackButton>;
  let locationSpy: { back: ReturnType<typeof vi.fn> };

  function setup(label?: string) {
    fixture = TestBed.createComponent(BackButton);
    if (label !== undefined) fixture.componentRef.setInput('label', label);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    locationSpy = { back: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BackButton],
      providers: [
        { provide: Location, useValue: locationSpy },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should default label to "Back" when not provided', () => {
    setup();
    expect(component.label()).toBe('Back');
  });

  it('should use a custom label when provided', () => {
    setup('Back to Reports');
    expect(component.label()).toBe('Back to Reports');
  });

  it('should render the label text in the button', () => {
    setup('Back to Users');
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('button')?.textContent).toContain('Back to Users');
  });

  it('should render as a type="button" element so it never submits a parent form', () => {
    setup();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.type).toBe('button');
  });

  it('goBack should call Location.back()', () => {
    setup();
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('clicking the button should call goBack (Location.back)', () => {
    setup();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
