import { Component, input, output } from '@angular/core';
import { Quiz } from '../../../core/models/quiz';

@Component({
  selector: 'app-view-quiz',
  imports: [],
  templateUrl: './view-quiz.html',
  styleUrl: './view-quiz.css',
})
export class ViewQuiz {
  quiz = input.required<Quiz>();
  closeModal = output<void>();
}
