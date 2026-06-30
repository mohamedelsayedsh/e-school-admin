import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { IncidentImage } from './incident-image';

describe('IncidentImage', () => {
  let component: IncidentImage;
  let fixture: ComponentFixture<IncidentImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentImage],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentImage);
    fixture.componentRef.setInput('imageUrl', 'https://example.com/test-image.jpg');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the provided image url', () => {
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe('https://example.com/test-image.jpg');
  });

  it('should emit closeModal when the close button is clicked', () => {
    let emitted = false;
    component.closeModal.subscribe(() => (emitted = true));

    fixture.detectChanges();
    const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-close-icon');
    closeBtn.click();

    expect(emitted).toBe(true);
  });

  it('should emit closeModal when the overlay (background) is clicked', () => {
    let emitted = false;
    component.closeModal.subscribe(() => (emitted = true));

    fixture.detectChanges();
    const overlay: HTMLElement = fixture.nativeElement.querySelector('.modal-overlay');
    overlay.click();

    expect(emitted).toBe(true);
  });

  it('should emit closeModal when the Close footer button is clicked', () => {
    let emitted = false;
    component.closeModal.subscribe(() => (emitted = true));

    fixture.detectChanges();
    const cancelBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-cancel');
    cancelBtn.click();

    expect(emitted).toBe(true);
  });

  it('should NOT emit closeModal when clicking inside the modal card itself', () => {
    let emitted = false;
    component.closeModal.subscribe(() => (emitted = true));

    fixture.detectChanges();
    const modalCard: HTMLElement = fixture.nativeElement.querySelector('.modal-card');
    modalCard.click();

    expect(emitted).toBe(false);
  });
});
