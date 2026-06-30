import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../../core/services/report';
import { ReportInterface } from '../../../core/models/report';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user';
import { CommonModule } from '@angular/common';
import { ActionEdit } from '../action-edit/action-edit';
import { Navbar } from '../../../shared/navbar/navbar';
import { Spinner } from '../../../shared/spinner/spinner';
import { BackButton } from "../../../shared/back-button/back-button";

@Component({
  selector: 'app-report-detail',
  imports: [CommonModule, ActionEdit, Navbar, Spinner, BackButton],
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.css',
})
export class ReportDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(ReportService);
  private userService = inject(UserService);

  report = signal<ReportInterface | null>(null);
  student = signal<User | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  isEditModalOpen = signal(false);

  private maxBehaviorCount = 1;

  ngOnInit() {
    this.fetchReportDetails();
  }

  fetchReportDetails() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.student.set(null);
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage.set('Invalid report ID.');
      this.isLoading.set(false);
      return;
    }

    this.reportService.getReportById(id).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.result) {
          let reportData: ReportInterface | null;
          if (Array.isArray(res.result)) {
            reportData = res.result.length > 0 ? res.result[0] : null;
          } else {
            reportData = res.result;
          }
          this.report.set(reportData);

          if (reportData) {
            this.calculateMax(reportData);
            this.fetchStudent(reportData.studentId);
          } else {
            this.errorMessage.set('Report not found.');
            this.isLoading.set(false);
          }
        } else {
          this.errorMessage.set(res.errorMessages?.join(', ') || 'Failed to load report.');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Report detail error:', err);
        this.errorMessage.set('Connection error. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private fetchStudent(studentId: number) {
    this.userService.getUserById(studentId).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.result) {
          this.student.set(res.result);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private calculateMax(report: ReportInterface) {
    this.maxBehaviorCount = Math.max(
      report.handRaisedCount,
      report.writtingCount,
      report.readingCount,
      report.lookingForwardCount,
      report.sleepingCount,
      report.lookingBackCount,
      report.standingCount,
      1
    );
  }

  getPercent(count: number): number {
    return Math.round((count / this.maxBehaviorCount) * 100);
  }

  goToStudent() {
    const s = this.student();
    if (s) {
      this.router.navigate(['/users', s.id]);
    }
  }

  goBack() {
    this.router.navigate(['/reports']);
  }
}
