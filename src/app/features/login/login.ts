import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  loginForm = new FormGroup({
    userName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  get f() { return this.loginForm.controls; }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    };

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials = {
      userName: this.loginForm.value.userName!,
      password: this.loginForm.value.password!
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(response.errorMessages?.join(', ') || 'Invalid username or password');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.errorMessages && err.error.errorMessages.length > 0) {
          this.errorMessage.set(err.error.errorMessages.join(', '));
        }
        else if (err.status === 401 || err.status === 400) {
          this.errorMessage.set('Invalid username or password');
        }
        else {
          this.errorMessage.set('An error occurred. Please try again later.');
        }
      }
    });
  }
}
