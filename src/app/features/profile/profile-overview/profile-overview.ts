import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-profile-overview',
  imports: [CommonModule],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.css',
})
export class ProfileOverview {
  user = input<User | null>(null);
  relatedUser = input<User | null>(null);
  relationLabel = input<string>('');
}
