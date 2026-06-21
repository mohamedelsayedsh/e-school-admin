import { ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz';
import { Navbar } from '../../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-builder',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-builder.html',
  styleUrl: './quiz-builder.css',
})
export class QuizBuilder implements OnInit {
  private formBuilder = inject(FormBuilder);
  private quizService = inject(QuizService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject (DestroyRef);

  quizId = input.required<number>();
  nextOrder = input.required<number>();
  closeModal = output<void>();

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  questionForm!: FormGroup
  ngOnInit() {
    this.questionForm = this.formBuilder.group({
    text: ['',[Validators.required]],
    order: [this.nextOrder(),[Validators.required,Validators.min(1)]],
    featureKey: ['',[Validators.required]],
    options: this.formBuilder.array([]),
  })
    this.addOption();
    this.addOption();
  }
  get options() {
    return this.questionForm.get('options') as FormArray;
  }
  get f(){
    return this.questionForm.controls;
  }

  addOption() {
    const optionGroup = this.formBuilder.group({
      text: ['',[Validators.required]],
      value: ['']
    });
    this.options.push(optionGroup);
    this.updateOptionValues();
    this.cdr.detectChanges();
  }
  removeOption(index:number){
    if(this.options.length > 2) {
      this.options.removeAt(index);
      this.updateOptionValues();
    } else {
      alert('A question must have at least 2 options.')
    }
  }

  updateOptionValues(){
    this.options.controls.forEach((control, index) =>{
      control.get('value')?.setValue(index.toString());
    })
  }
  onSubmit() {
    if (this.questionForm.invalid|| this.options.length < 2){
      this.questionForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const sub = this.quizService.addQuestionToQuiz(this.quizId(), this.questionForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if(response.isSuccess){
          this.successMessage = 'Question added successfully! Add the next one below.';
          const nextOrder = this.questionForm.value.order + 1;
          this.resetForm(nextOrder);
        } else {
          this.errorMessage = response.errorMessages?.join(', ') || 'Failed to add question.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Connection error. Question was not saved.'
        this.cdr.detectChanges();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
  resetForm(nextOrder: number){
    this.questionForm.reset({text: '', order : nextOrder, featureKey: ''});
    this.options.clear();
    this.addOption();
    this.addOption();
  }
}
