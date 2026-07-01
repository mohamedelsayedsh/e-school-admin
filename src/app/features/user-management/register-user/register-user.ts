import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../../shared/navbar/navbar';
import { UserService } from '../../../core/services/user';
import { Spinner } from '../../../shared/spinner/spinner';

interface RoleOption {
  id: number;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar , Spinner],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  isLoading = signal(true);
  loadingMessage = signal('Loading registration form...');

  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);

  roles: RoleOption[] = [
    { id: 1, label: 'Admin',   icon: 'bi-shield-lock',  description: 'Full system access' },
    { id: 2, label: 'Student', icon: 'bi-mortarboard',  description: 'Enrolled learner'   },
    { id: 4, label: 'Parent',  icon: 'bi-people-fill',  description: 'Parent / Guardian'  },
  ];

  registerForm!: FormGroup;

  ngOnInit() {
    this.registerForm = this.fb.group({
      userName:    ['', [Validators.required, Validators.minLength(3)]],
      email:       ['', [Validators.required, Validators.email]],

      password:    ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],

      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^(\\+201|01|00201)[0-2,5]{1}[0-9]{8}$')
      ]],

      roleID:      [null, [Validators.required]],
    });
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  get f() { return this.registerForm.controls; }

  selectRole(roleId: number) {
    this.registerForm.patchValue({ roleID: roleId });
    this.registerForm.get('roleID')?.markAsTouched();
  }

  resetForm() {
    this.registerForm.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.loadingMessage.set('Registering new user...');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.registerUser(this.registerForm.value).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.successMessage.set('User registered successfully! Redirecting...');
          setTimeout(() => {
            this.isLoading.set(false);
            this.router.navigate(['/users']);
          }, 1500);
        } else {
          this.isLoading.set(false);
          this.errorMessage.set(res.errorMessages?.join(', ') || 'Failed to register user.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.errorMessages?.join(', ') || 'Connection error. Please try again.');
      },
    });
  }
}
