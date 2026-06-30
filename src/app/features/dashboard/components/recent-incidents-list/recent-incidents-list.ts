import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recent-incidents-list',
  imports: [CommonModule,RouterLink],
  templateUrl: './recent-incidents-list.html',
  styleUrl: './recent-incidents-list.css',
})
export class RecentIncidentsList {
  incidents = input.required<any[]>();
}
