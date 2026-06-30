import { Component, inject, input, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  pageTitle = input.required<string>();
  private router = inject(Router);
  private authService = inject(AuthService);
  userName = signal('');
  ngOnInit(){
    this.userName.set(this.authService.getUserName());
  }
  onLogout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
