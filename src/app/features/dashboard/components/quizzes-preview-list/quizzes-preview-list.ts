import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quizzes-preview-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './quizzes-preview-list.html',
  styleUrl: './quizzes-preview-list.css',
})
export class QuizzesPreviewList {
  quizzes = input.required<any[]>();
}
