import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-incident-image',
  imports: [],
  templateUrl: './incident-image.html',
  styleUrl: './incident-image.css',
})
export class IncidentImage {
  imageUrl = input.required<string>();

  closeModal = output<void>();
}
