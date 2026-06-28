import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { QuizService } from '../../../core/services/quiz';
import { ReportService } from '../../../core/services/report';
import { QuizAnalysis } from '../../../core/models/quiz';
import { ReportInterface } from '../../../core/models/report';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile-activity',
  imports: [DatePipe],
  templateUrl: './profile-activity.html',
  styleUrl: './profile-activity.css',
})
export class ProfileActivity implements OnInit {
  studentId = input.required<number>();

  private quizService = inject(QuizService);
  private reportService = inject(ReportService);
  private router = inject(Router);

  quizAnalyses = signal<QuizAnalysis[]>([]);
  reports = signal<ReportInterface[]>([]);

  isLoadingQuizzes = signal(true);
  isLoadingReports = signal(true);

  ngOnInit(): void {
    this.loadQuizAnalyses();
    this.loadReports();
  }

  private loadQuizAnalyses(): void {
    this.quizService.getAllQuizAnalyses().subscribe({
      next: (res) => {
        const filtered = (res.result || []).filter(
          (q) => q.studentId === this.studentId()
        );
        this.quizAnalyses.set(filtered);
        this.isLoadingQuizzes.set(false);
      },
      error: () => this.isLoadingQuizzes.set(false),
    });
  }

  private loadReports(): void {
    this.reportService.getAllReports().subscribe({
      next: (res) => {
        const filtered = (res.result || []).filter(
          (r) => r.studentId === this.studentId()
        );
        this.reports.set(filtered);
        this.isLoadingReports.set(false);
      },
      error: () => this.isLoadingReports.set(false),
    });
  }

  goToReport(reportId: number): void {
    this.router.navigate(['/reports', reportId]);
  }
}
