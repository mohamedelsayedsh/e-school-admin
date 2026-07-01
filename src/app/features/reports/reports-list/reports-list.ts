import { ReportService } from './../../../core/services/report';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../shared/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportInterface } from '../../../core/models/report';
import { UserService } from '../../../core/services/user';
import { Spinner } from "../../../shared/spinner/spinner";
import { TableCard } from "../../../shared/table-card/table-card";

@Component({
  selector: 'app-reports-list',
  imports: [Navbar, CommonModule, NgClass, FormsModule, Spinner, TableCard],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.css',
})
export class ReportsList implements OnInit {
  private reportService = inject(ReportService);
  private userService = inject(UserService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  reports = signal<ReportInterface[]>([]);
  filteredReports = signal<ReportInterface[]>([]);
  studentNames = signal<Map<number, string>>(new Map());

    private loadStudentNames() {
      const sub = this.userService.getAllUsers().subscribe({
        next: (res) => {
          if (res.isSuccess && res.result) {
            const map = new Map<number, string>();
            res.result.forEach(user => map.set(Number(user.id), user.userName));
            this.studentNames.set(map);
          }
        },
        error: () => {}
      });
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    }

    getStudentName(studentId: number): string {
      return this.studentNames().get(Number(studentId)) ?? `Student #${studentId}`;
    }

  isLoading = signal(true);
  errorMessage = signal('');

  filterWeek = '';
  filterRisk = '';
  filterStatus = '';

  get availableWeeks(): number[] {
    return [...new Set(this.reports().map(r => r.weekNumber))].sort((a, b) => a - b);
  }

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.isLoading.set(true);
    const sub = this.reportService.getAllReports().subscribe({
      next: (response) => {
        if (response.isSuccess && response.result) {
          this.reports.set(response.result);
          this.filteredReports.set(response.result);
          this.loadStudentNames();
        } else {
          this.errorMessage.set('Failed to load reports.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Connection error. Please try again later.');
        this.isLoading.set(false);
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }


  applyFilters() {
    let result = this.reports();

    if (this.filterWeek) {
      result = result.filter(r => r.weekNumber === Number(this.filterWeek));
    }
    if (this.filterRisk) {
      result = result.filter(r => r.riskLevel === this.filterRisk);
    }
    if (this.filterStatus) {
      result = result.filter(r => r.status === this.filterStatus);
    }

    this.filteredReports.set(result);
  }

  viewReportDetails(reportId: number) {
    this.router.navigate(['/reports', reportId]);
  }
}
