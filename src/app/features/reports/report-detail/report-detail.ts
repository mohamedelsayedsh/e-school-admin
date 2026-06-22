import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../../core/services/report';
import { ReportInterface } from '../../../core/models/report';
import { CommonModule } from '@angular/common';
import { ActionEdit } from '../action-edit/action-edit';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-report-detail',
  imports: [CommonModule, ActionEdit, Navbar],
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.css',
})
export class ReportDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(ReportService);

  report: ReportInterface | null = null;
  isLoading = true;
  isEditModalOpen = false;

  // The maximum count across all behaviors — used to scale progress bars
  private maxBehaviorCount = 1;

  ngOnInit() {
    this.fetchReportDetails();
  }

  fetchReportDetails() {
    this.isLoading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.isLoading = false;
      return;
    }

    this.reportService.getReportById(id).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.result && res.result.length > 0) {
          this.report = res.result[0];
          this.calculateMax();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private calculateMax() {
    if (!this.report) return;
    const allCounts = [
      this.report.handRaisedCount,
      this.report.writtingCount,
      this.report.readingCount,
      this.report.lookingForwardCount,
      this.report.sleepingCount,
      this.report.lookingBackCount,
      this.report.standingCount,
    ];
    this.maxBehaviorCount = Math.max(...allCounts, 1);
  }

  /**
   * Returns a percentage (0–100) relative to the highest behavior count,
   * so the bar with the highest count fills 100% and all others scale down.
   */
  getPercent(count: number): number {
    return Math.round((count / this.maxBehaviorCount) * 100);
  }

  goBack() {
    this.router.navigate(['/reports']);
  }
}
