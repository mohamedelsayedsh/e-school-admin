import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recent-reports-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-reports-list.html',
  styleUrl: './recent-reports-list.css',
})
export class RecentReportsList {
  reports = input.required<any[]>(); // You can replace 'any' with ReportInterface if imported

  riskBadgeClass(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'badge-high';
      case 'medium':
      case 'moderate':
        return 'badge-medium';
      default:
        return 'badge-low';
    }
  }
}
