import { QuizService } from './../../../core/services/quiz';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-quiz',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-quiz.html',
  styleUrl: './create-quiz.css',
})
export class CreateQuiz {
  closeModal = output<void>();
  quizCreated = output<void>();
  private formBuilder = inject(FormBuilder);
  private quizService = inject(QuizService);
  private destroyRef = inject(DestroyRef)


  quizForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';

  get f() { return this.quizForm.controls; }

  onSubmit() {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const sub = this.quizService.createQuiz(this.quizForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.quizCreated.emit();
          this.closeModal.emit();
        } else {
          this.errorMessage = response.errorMessages?.join(', ') || 'Failed to create quiz';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Connection error. Please try again.';
      }
      });
      this.destroyRef.onDestroy(() => sub.unsubscribe())
    }
}
