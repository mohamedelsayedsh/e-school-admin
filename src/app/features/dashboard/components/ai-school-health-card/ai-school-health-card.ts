import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ai-school-health-card',
  imports: [CommonModule],
  templateUrl: './ai-school-health-card.html',
  styleUrl: './ai-school-health-card.css',
})
export class AiSchoolHealthCard {
  overallHealth = input.required<number>();
  healthLabel = input.required<string>();
  averageEmotion = input.required<string>();
  mostDetectedBehavior = input.required<string>();
  studentsNeedingAttention = input.required<number>();
}
