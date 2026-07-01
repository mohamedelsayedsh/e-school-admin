import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  pageTitle = input.required<string>();

  private router = inject(Router);
  private authService = inject(AuthService);

  userName = signal('');
  currentDate = new Date();

  isDashboard = computed(() => this.pageTitle() === 'Dashboard');

  ngOnInit() {
    this.userName.set(this.authService.getUserName());
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
