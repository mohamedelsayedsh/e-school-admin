import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Navbar } from "../../../shared/navbar/navbar";
import { QuizService } from '../../../core/services/quiz';
import { Quiz } from '../../../core/models/quiz';
import { CreateQuiz } from "../create-quiz/create-quiz";
import { QuizBuilder } from "../quiz-builder/quiz-builder";
import { ViewQuiz } from "../view-quiz/view-quiz";

@Component({
  selector: 'app-quizzes-list',
  imports: [Navbar, CreateQuiz, QuizBuilder, ViewQuiz],
  templateUrl: './quizzes-list.html',
  styleUrl: './quizzes-list.css',
})
export class QuizzesList  implements OnInit{

  private quizService = inject(QuizService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  quizzes: Quiz[] = [];
  isLoading = true;
  errorMessage = '';
  isModalOpen = false;
  isBuilderModalOpen = false;
  isViewModalOpen = false;
  selectedQuizId: number = 0;
  selectedNextOrder: number =1;
  selectedViewQuiz: Quiz | null = null;

  ngOnInit(){
    this.fetchQuizzes();
  }

  fetchQuizzes(){
    this.isLoading = true;
    const sub = this.quizService.getAllQuizzes().subscribe({
      next: (response) => {
        if(response.isSuccess) {
          this.quizzes = response.result || [];
        } else {
          this.errorMessage = response.errorMessages?.join(', ') || 'Failed to load quizzes.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Connection error. Please check your backend.'
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    })
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
  openCreateQuizModal() {
    console.log('Open Create Quiz Modal clicked!');
    this.isModalOpen= true;
  }
  editQuiz(quizId: number) {
    this.selectedQuizId = quizId;
    const selectedQuiz = this.quizzes.find(q => q.id === quizId);
    if(selectedQuiz && selectedQuiz.questions){
      this.selectedNextOrder = selectedQuiz.questions.length + 1;
    } else{
      this.selectedNextOrder = 1;
    }
    this.isBuilderModalOpen = true;
    this.cdr.detectChanges();
    console.log('Navigate to Edit Quiz with ID:', quizId);
  }
  viewQuiz(quiz: Quiz){
    this.selectedViewQuiz = quiz;
    this.isViewModalOpen = true;
  }
}
