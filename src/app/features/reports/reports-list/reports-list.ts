import { ReportService } from './../../../core/services/report';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Navbar } from '../../../shared/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportInterface } from '../../../core/models/report';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-reports-list',
  imports: [Navbar, CommonModule, NgClass, FormsModule],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.css',
})
export class ReportsList implements OnInit {
  private reportService = inject(ReportService);
  private userService = inject(UserService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  reports: ReportInterface[] = [];
  filteredReports: ReportInterface[] = [];
  studentNames: Map<number, string> = new Map();

  isLoading = true;
  errorMessage = '';

  filterWeek = '';
  filterRisk = '';
  filterStatus = '';

  get availableWeeks(): number[] {
    return [...new Set(this.reports.map(r => r.weekNumber))].sort((a, b) => a - b);
  }

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.isLoading = true;
    const sub = this.reportService.getAllReports().subscribe({
      next: (response) => {
        if (response.isSuccess && response.result) {
          this.reports = response.result;
          this.filteredReports = this.reports;
          this.loadStudentNames();
        } else {
          this.errorMessage = 'Failed to load reports.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Connection error. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private loadStudentNames() {
    // Collect unique student IDs and fetch their names
    const uniqueIds = [...new Set(this.reports.map(r => r.studentId))];
    let pending = uniqueIds.length;
    if (pending === 0) return;

    uniqueIds.forEach(id => {
      const sub = this.userService.getUserById(id).subscribe({
        next: (res) => {
          if (res.isSuccess && res.result) {
            this.studentNames.set(id, res.result.userName);
          }
          pending--;
          if (pending === 0) this.cdr.detectChanges();
        },
        error: () => {
          pending--;
          if (pending === 0) this.cdr.detectChanges();
        }
      });
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    });
  }

  getStudentName(studentId: number): string {
    return this.studentNames.get(studentId) ?? `Student #${studentId}`;
  }

  applyFilters() {
    let result = this.reports;

    if (this.filterWeek) {
      result = result.filter(r => r.weekNumber === Number(this.filterWeek));
    }
    if (this.filterRisk) {
      result = result.filter(r => r.riskLevel === this.filterRisk);
    }
    if (this.filterStatus) {
      result = result.filter(r => r.status === this.filterStatus);
    }

    this.filteredReports = result;
  }

  viewReportDetails(reportId: number) {
    this.router.navigate(['/reports', reportId]);
  }
}
