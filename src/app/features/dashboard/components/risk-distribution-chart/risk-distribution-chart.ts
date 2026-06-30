import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-risk-distribution-chart',
  imports: [CommonModule],
  templateUrl: './risk-distribution-chart.html',
  styleUrl: './risk-distribution-chart.css',
})
export class RiskDistributionChart {
  distribution = input.required<{
    high: { count: number, pct: number },
    medium: { count: number, pct: number },
    low: { count: number, pct: number }
  }>();
  gradient = input.required<string>();
}
