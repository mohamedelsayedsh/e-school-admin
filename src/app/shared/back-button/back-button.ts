import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-back-button',
  imports: [],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  label = input<string>('Back');
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
