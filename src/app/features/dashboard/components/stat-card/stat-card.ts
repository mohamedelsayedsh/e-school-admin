import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  icon = input.required<string>();
  color = input.required<string>();
  label = input.required<string>();
  value = input.required<number>();
  subLabel = input<string>();
  subClass = input<string>();
}
