import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../core/services/report';
import { ReportInterface } from '../../../core/models/report';

@Component({
  selector: 'app-action-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './action-edit.html',
  styleUrl: './action-edit.css',
})
export class ActionEdit implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);

  report = input.required<ReportInterface>();
  closeModal = output<void>();
  reportUpdated = output<void>();

  actionForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  ngOnInit() {
    this.actionForm = this.fb.group({
      riskLevel:     [this.report().riskLevel,    Validators.required],
      status:        [this.report().status,        Validators.required],
      // form field matches model spelling; we remap on submit for the API
      recomendation: [this.report().recomendation, Validators.required],
    });
  }

  onSubmit() {
    if (this.actionForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const { riskLevel, status, recomendation } = this.actionForm.value;

    this.reportService.updateReportAction(this.report().id, {
      riskLevel,
      status,
      recomendations: recomendation, // API uses plural spelling
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.reportUpdated.emit();
          this.closeModal.emit();
        } else {
          this.errorMessage = res.errorMessages?.join(', ') || 'Failed to update report.';
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.errorMessage = 'Connection error. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
