import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-back-button',
  imports: [RouterLink],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  label = input<string>('Back');
  routePath = input.required<string>();
}
