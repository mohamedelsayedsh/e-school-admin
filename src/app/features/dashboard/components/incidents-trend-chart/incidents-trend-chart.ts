import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-incidents-trend-chart',
  imports: [CommonModule],
  templateUrl: './incidents-trend-chart.html',
  styleUrl: './incidents-trend-chart.css',
})
export class IncidentsTrendChart {
  trendLinePoints = input.required<string>();
  trendDots = input.required<{x: number, y: number, value: number}[]>();
  weekDays = input.required<string[]>();
}
