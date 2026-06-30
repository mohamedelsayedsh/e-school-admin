import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../core/services/report';
import { ReportInterface } from '../../../core/models/report';

@Component({
  selector: 'app-action-edit',
  standalone: true,
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

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    this.actionForm = this.fb.group({
      riskLevel:     [this.report().riskLevel,     Validators.required],
      status:        [this.report().status,        Validators.required],
      recomendation: [this.report().recomendation, Validators.required],
    });
  }

  onSubmit() {
    if (this.actionForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { riskLevel, status, recomendation } = this.actionForm.value;

    this.reportService.updateReportAction(this.report().id, {
      riskLevel,
      status,
      recomendations: recomendation,
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.reportUpdated.emit();
          this.closeModal.emit();
        } else {
          this.errorMessage.set(res.errorMessages?.join(', ') || 'Failed to update report.');
        }
        this.isSubmitting.set(false);
      },
      error: () => {
        this.errorMessage.set('Connection error. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }
}
