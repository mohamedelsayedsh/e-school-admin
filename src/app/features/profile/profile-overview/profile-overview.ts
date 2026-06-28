import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 👈 استدعاء الراوتر
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-profile-overview',
  imports: [CommonModule],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.css',
})
export class ProfileOverview {
  private router = inject(Router); // 👈 تعريف الراوتر

  user = input<User | null>(null);
  relatedUser = input<User | null>(null);
  relationLabel = input<string>('');

  // 🚀 دالة النقل للبروفايل المرتبط (الأب أو الابن)
  goToRelatedUser() {
    const relatedId = this.relatedUser()?.id;
    if (relatedId) {
      this.router.navigate(['/users', relatedId]);
    }
  }
}
