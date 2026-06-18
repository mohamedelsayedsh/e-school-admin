import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, Navbar],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  users: User[] = [];
  isLoading = true;
  errorMessage = '';

  rolesMap: { [key: number]: string } = {
    1: 'Student',
    2: 'Teacher',
    3: 'Parent',
    4: 'Admin'
  };

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Data from Server:', response);
        if (response.isSuccess) {
          this.users = response.result;
          console.log('Users:', this.users);
          console.log('Length:', this.users.length);
        } else {
          this.errorMessage = response.errorMessages.join(', ');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
      console.error(err);
      this.errorMessage = err.message;
      this.isLoading = false;
      this.cdr.detectChanges();
      }
    });
  }

  getRoleName(roleId: number): string {
    return this.rolesMap[roleId] || 'Unknown Role';
  }
}
