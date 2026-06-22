import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, Navbar],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  errorMessage = '';

  selectedRoleId: string = '';
  searchTerm: string = '';

  // delete flow state
  userToDelete: User | null = null;
  isDeleting = false;
  deleteError = '';

  rolesMap: { [key: number]: string } = {
    1: 'Admin',
    2: 'Student',
    3: 'Owner',
    4: 'Parent'
  };

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.users = response.result;
          this.filteredUsers = this.users;
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

  onRoleFilterChange(roleId: string) {
    this.selectedRoleId = roleId;
    this.applyFilters();
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.applyFilters();
  }

  private applyFilters() {
    let result = this.users;

    if (this.selectedRoleId) {
      result = result.filter(u => u.roleID === Number(this.selectedRoleId));
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(u =>
        u.userName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phoneNumber?.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = result;
  }

  getRoleName(roleId: number): string {
    return this.rolesMap[roleId] || 'Unknown Role';
  }

  viewUserProfile(userId: number) {
    this.router.navigate(['/users',userId]);
  }

  // ---- Delete flow ----

  openDeleteConfirm(user: User) {
    this.userToDelete = user;
    this.deleteError = '';
  }

  cancelDelete() {
    this.userToDelete = null;
    this.deleteError = '';
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.isDeleting = true;
    this.deleteError = '';

    const sub = this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
          this.applyFilters();
          this.userToDelete = null;
        } else {
          this.deleteError = response.errorMessages?.join(', ') || 'Failed to delete user.';
        }
        this.isDeleting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleteError = err.error?.errorMessages?.join(', ') || 'Connection error. Please try again.';
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
