import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { ActionEdit } from './action-edit';
import { ReportService } from '../../../core/services/report';
import { ReportInterface } from '../../../core/models/report';

describe('ActionEdit', () => {
  let component: ActionEdit;
  let fixture: ComponentFixture<ActionEdit>;
  let reportServiceSpy: { updateReportAction: ReturnType<typeof vi.fn> };

  const mockReport: ReportInterface = {
    id: 5,
    studentId: 10,
    weekNumber: 3,
    totalImages: 100,
    sleepingCount: 2,
    lookingBackCount: 4,
    handRaisedCount: 8,
    writtingCount: 6,
    readingCount: 10,
    standingCount: 1,
    lookingForwardCount: 12,
    avgConfidence: 0.85,
    riskLevel: 'High',
    status: 'Pending',
    recomendation: 'Immediate review required',
  };

  function setup() {
    fixture = TestBed.createComponent(ActionEdit);
    component = fixture.componentInstance;

    // CRITICAL: Hydrate the required signal input BEFORE detectChanges
    fixture.componentRef.setInput('report', mockReport);

    fixture.detectChanges();
  }

  async function configure() {
    await TestBed.configureTestingModule({
      imports: [ActionEdit, ReactiveFormsModule],
      providers: [
        { provide: ReportService, useValue: reportServiceSpy }
      ],
    }).compileComponents();
  }

  beforeEach(() => {
    reportServiceSpy = { updateReportAction: vi.fn() };

    // Default successful API response
    reportServiceSpy.updateReportAction.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: null })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create and initialize the form with the signal input data', async () => {
      await configure();
      setup();

      expect(component).toBeTruthy();
      expect(component.actionForm.value).toEqual({
        riskLevel: 'High',
        status: 'Pending',
        recomendation: 'Immediate review required'
      });
      expect(component.isSubmitting()).toBe(false);
      expect(component.errorMessage()).toBe('');
    });
  });

  describe('Form Validation & State Guards', () => {
    it('should not submit and should not call the API if the form is invalid', async () => {
      await configure();
      setup();

      // Clear a required field
      component.actionForm.controls['status'].setValue('');

      component.onSubmit();

      expect(component.actionForm.invalid).toBe(true);
      expect(component.isSubmitting()).toBe(false);
      expect(reportServiceSpy.updateReportAction).not.toHaveBeenCalled();
    });

    it('should prevent duplicate API calls if submission is already in progress', async () => {
      await configure();
      setup();

      // Force the submitting state to true to simulate an ongoing request
      component.isSubmitting.set(true);

      component.onSubmit();

      expect(reportServiceSpy.updateReportAction).not.toHaveBeenCalled();
    });
  });

  describe('Submission Behaviors', () => {
    it('should map form data correctly, call the API, and emit outputs on success', async () => {
      await configure();
      setup();

      // Spy on the OutputEmitterRefs
      const reportUpdatedSpy = vi.spyOn(component.reportUpdated, 'emit');
      const closeModalSpy = vi.spyOn(component.closeModal, 'emit');

      // Update form values
      component.actionForm.patchValue({
        status: 'Resolved',
        recomendation: 'Student successfully monitored'
      });

      component.onSubmit();

      // Verify the API payload mapped correctly (checking the 'recomendation' -> 'recomendations' mapping)
      expect(reportServiceSpy.updateReportAction).toHaveBeenCalledWith(5, {
        riskLevel: 'High',
        status: 'Resolved',
        recomendations: 'Student successfully monitored'
      });

      // Verify outputs emitted
      expect(reportUpdatedSpy).toHaveBeenCalledTimes(1);
      expect(closeModalSpy).toHaveBeenCalledTimes(1);

      // Verify end state
      expect(component.isSubmitting()).toBe(false);
      expect(component.errorMessage()).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should show specific error message when API returns isSuccess: false with errors', async () => {
      reportServiceSpy.updateReportAction.mockReturnValue(
        of({ isSuccess: false, statusCode: 400, errorMessages: ['Invalid status transition', 'Missing permissions'], result: null })
      );
      await configure();
      setup();

      const reportUpdatedSpy = vi.spyOn(component.reportUpdated, 'emit');

      component.onSubmit();

      expect(component.isSubmitting()).toBe(false);
      expect(component.errorMessage()).toBe('Invalid status transition, Missing permissions');
      expect(reportUpdatedSpy).not.toHaveBeenCalled();
    });

    it('should fall back to a generic message when isSuccess is false but no errorMessages are provided', async () => {
      reportServiceSpy.updateReportAction.mockReturnValue(
        of({ isSuccess: false, statusCode: 400, errorMessages: [], result: null })
      );
      await configure();
      setup();

      component.onSubmit();

      expect(component.errorMessage()).toBe('Failed to update report.');
      expect(component.isSubmitting()).toBe(false);
    });

    it('should set a connection error message when the HTTP request itself throws an error', async () => {
      reportServiceSpy.updateReportAction.mockReturnValue(throwError(() => new Error('Network offline')));
      await configure();
      setup();

      component.onSubmit();

      expect(component.errorMessage()).toBe('Connection error. Please try again.');
      expect(component.isSubmitting()).toBe(false);
    });
  });
});
