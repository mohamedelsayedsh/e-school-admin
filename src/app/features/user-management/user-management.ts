import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Spinner } from "../../shared/spinner/spinner";
import { TableCard } from "../../shared/table-card/table-card";

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, Navbar, Spinner, TableCard],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  selectedRoleId: string = '';
  searchTerm: string = '';

  // delete flow state
  userToDelete = signal<User | null>(null);
  isDeleting = signal(false);
  deleteError = signal('');

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
    this.isLoading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.users.set(response.result);
          this.filteredUsers.set(response.result);
        } else {
          this.errorMessage.set(response.errorMessages.join(', '));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
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
    let result = this.users();

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

    this.filteredUsers.set(result);
  }

  getRoleName(roleId: number): string {
    return this.rolesMap[roleId] || 'Unknown Role';
  }

  viewUserProfile(userId: number) {
    this.router.navigate(['/users',userId]);
  }

  // ---- Delete flow ----

  openDeleteConfirm(user: User) {
    this.userToDelete.set(user);
    this.deleteError.set('');
  }

  cancelDelete() {
    this.userToDelete.set(null);
    this.deleteError.set('');
  }

  confirmDelete() {
    const toDelete = this.userToDelete();
    if (!toDelete) return;

    this.isDeleting.set(true);
    this.deleteError.set('');

    const sub = this.userService.deleteUser(toDelete.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.users.set(this.users().filter(u => u.id !== toDelete.id));
          this.applyFilters();
          this.userToDelete.set(null);
        } else {
          this.deleteError.set(response.errorMessages?.join(', ') || 'Failed to delete user.');
        }
        this.isDeleting.set(false);
      },
      error: (err) => {
        this.deleteError.set(err.error?.errorMessages?.join(', ') || 'Connection error. Please try again.');
        this.isDeleting.set(false);
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
