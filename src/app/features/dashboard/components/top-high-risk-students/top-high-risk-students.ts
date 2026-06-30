import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-top-high-risk-students',
  imports: [CommonModule],
  templateUrl: './top-high-risk-students.html',
  styleUrl: './top-high-risk-students.css',
})
export class TopHighRiskStudents {
  students = input.required<any[]>();

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
