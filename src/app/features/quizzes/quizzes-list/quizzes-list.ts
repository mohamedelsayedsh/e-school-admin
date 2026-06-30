import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Navbar } from "../../../shared/navbar/navbar";
import { QuizService } from '../../../core/services/quiz';
import { Quiz } from '../../../core/models/quiz';
import { CreateQuiz } from "../create-quiz/create-quiz";
import { QuizBuilder } from "../quiz-builder/quiz-builder";
import { ViewQuiz } from "../view-quiz/view-quiz";
import { Spinner } from "../../../shared/spinner/spinner";
import { TableCard } from "../../../shared/table-card/table-card";

@Component({
  selector: 'app-quizzes-list',
  imports: [Navbar, CreateQuiz, QuizBuilder, ViewQuiz, Spinner, TableCard],
  templateUrl: './quizzes-list.html',
  styleUrl: './quizzes-list.css',
})
export class QuizzesList  implements OnInit{

  private quizService = inject(QuizService);
  private destroyRef = inject(DestroyRef);

  quizzes = signal<Quiz[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  isModalOpen = signal(false);
  isBuilderModalOpen = signal(false);
  isViewModalOpen = signal(false);
  selectedQuizId = signal(0);
  selectedNextOrder = signal(1);
  selectedViewQuiz = signal<Quiz | null>(null);

  ngOnInit(){
    this.fetchQuizzes();
  }

  fetchQuizzes(){
    this.isLoading.set(true);
    const sub = this.quizService.getAllQuizzes().subscribe({
      next: (response) => {
        if(response.isSuccess) {
          this.quizzes.set(response.result || []);
        } else {
          this.errorMessage.set(response.errorMessages?.join(', ') || 'Failed to load quizzes.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Connection error. Please check your backend.');
        this.isLoading.set(false);
      }
    })
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
  openCreateQuizModal() {
    this.isModalOpen.set(true);
  }
  editQuiz(quizId: number) {
    this.selectedQuizId.set(quizId);
    const selectedQuiz = this.quizzes().find(q => q.id === quizId);
    if(selectedQuiz && selectedQuiz.questions){
      this.selectedNextOrder.set(selectedQuiz.questions.length + 1);
    } else{
      this.selectedNextOrder.set(1);
    }
    this.isBuilderModalOpen.set(true);
  }
  viewQuiz(quiz: Quiz){
    this.selectedViewQuiz.set(quiz);
    this.isViewModalOpen.set(true);
  }
}
