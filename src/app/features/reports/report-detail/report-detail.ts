import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  report: ReportInterface | null = null;
  student: User | null = null;
  isLoading = true;
  errorMessage = '';
  isEditModalOpen = false;

  private maxBehaviorCount = 1;

  ngOnInit() {
    this.fetchReportDetails();
  }

  fetchReportDetails() {
    this.isLoading = true;
    this.errorMessage = '';
    this.student = null;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid report ID.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.reportService.getReportById(id).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.result) {
          if (Array.isArray(res.result)) {
            this.report = res.result.length > 0 ? res.result[0] : null;
          } else {
            this.report = res.result;
          }

          if (this.report) {
            this.calculateMax();
            this.fetchStudent(this.report.studentId);
          } else {
            this.errorMessage = 'Report not found.';
            this.isLoading = false;
          }
        } else {
          this.errorMessage = res.errorMessages?.join(', ') || 'Failed to load report.';
          this.isLoading = false;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Report detail error:', err);
        this.errorMessage = 'Connection error. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private fetchStudent(studentId: number) {
    this.userService.getUserById(studentId).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.result) {
          this.student = res.result;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calculateMax() {
    if (!this.report) return;
    this.maxBehaviorCount = Math.max(
      this.report.handRaisedCount,
      this.report.writtingCount,
      this.report.readingCount,
      this.report.lookingForwardCount,
      this.report.sleepingCount,
      this.report.lookingBackCount,
      this.report.standingCount,
      1
    );
  }

  getPercent(count: number): number {
    return Math.round((count / this.maxBehaviorCount) * 100);
  }

  goToStudent() {
    if (this.student) {
      this.router.navigate(['/users', this.student.id]);
    }
  }

  goBack() {
    this.router.navigate(['/reports']);
  }
}
