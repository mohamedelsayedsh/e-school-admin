import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UserManagement } from './user-management';
import { UserService } from '../../core/services/user';
import { User } from '../../core/models/user';

describe('UserManagement', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;
  let userServiceSpy: { getAllUsers: ReturnType<typeof vi.fn>; deleteUser: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  const mockUsers: User[] = [
    { id: 1, userName: 'Ahmed', email: 'ahmed@test.com', phoneNumber: '01001234567', roleID: 2 },
    { id: 2, userName: 'Sara', email: 'sara@test.com', phoneNumber: '01007654321', roleID: 2 },
    { id: 3, userName: 'AdminUser', email: 'admin@test.com', phoneNumber: '01009999999', roleID: 1 },
  ];

  function setup() {
    fixture = TestBed.createComponent(UserManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    userServiceSpy = { getAllUsers: vi.fn(), deleteUser: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    userServiceSpy.getAllUsers.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockUsers })
    );

    await TestBed.configureTestingModule({
      imports: [UserManagement],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    setup();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users and mirror them into filteredUsers on success', () => {
    expect(component.users()).toEqual(mockUsers);
    expect(component.filteredUsers()).toEqual(mockUsers);
    expect(component.isLoading()).toBe(false);
  });

  it('should set errorMessage when the backend reports failure', () => {
    userServiceSpy.getAllUsers.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: ['Bad request'], result: [] })
    );
    setup();

    expect(component.errorMessage()).toBe('Bad request');
    expect(component.isLoading()).toBe(false);
  });

  it('should set errorMessage from err.message when the request errors out', () => {
    userServiceSpy.getAllUsers.mockReturnValue(throwError(() => new Error('network down')));
    setup();

    expect(component.errorMessage()).toBe('network down');
    expect(component.isLoading()).toBe(false);
  });

  describe('getRoleName', () => {
    it('should resolve known role ids to their labels', () => {
      expect(component.getRoleName(1)).toBe('Admin');
      expect(component.getRoleName(2)).toBe('Student');
      expect(component.getRoleName(3)).toBe('Owner');
      expect(component.getRoleName(4)).toBe('Parent');
    });

    it('should fall back to "Unknown Role" for an unmapped id', () => {
      expect(component.getRoleName(999)).toBe('Unknown Role');
    });
  });

  describe('filtering', () => {
    it('onRoleFilterChange should filter the list by roleID', () => {
      component.onRoleFilterChange('2'); // Student
      expect(component.filteredUsers().map(u => u.id)).toEqual([1, 2]);
    });

    it('onRoleFilterChange("") should clear the role filter and show all users', () => {
      component.onRoleFilterChange('2');
      component.onRoleFilterChange('');
      expect(component.filteredUsers()).toEqual(mockUsers);
    });

    it('onSearchChange should filter case-insensitively by userName', () => {
      component.onSearchChange('ahm');
      expect(component.filteredUsers().map(u => u.id)).toEqual([1]);
    });

    it('onSearchChange should filter case-insensitively by email', () => {
      component.onSearchChange('SARA@TEST');
      expect(component.filteredUsers().map(u => u.id)).toEqual([2]);
    });

    it('onSearchChange should filter by phoneNumber', () => {
      component.onSearchChange('9999999');
      expect(component.filteredUsers().map(u => u.id)).toEqual([3]);
    });

    it('onSearchChange with whitespace-only input should behave as no filter', () => {
      component.onSearchChange('   ');
      expect(component.filteredUsers()).toEqual(mockUsers);
    });

    it('role filter and search term should combine with AND logic', () => {
      component.onRoleFilterChange('2'); // Ahmed + Sara
      component.onSearchChange('sara');  // narrows further to just Sara

      expect(component.filteredUsers().map(u => u.id)).toEqual([2]);
    });

    it('a filter combination matching nothing should return an empty array', () => {
      component.onRoleFilterChange('1'); // only AdminUser
      component.onSearchChange('ahmed'); // AdminUser doesn't match "ahmed"

      expect(component.filteredUsers()).toEqual([]);
    });
  });

  it('viewUserProfile should navigate to /users/:id', () => {
    component.viewUserProfile(7);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', 7]);
  });

  describe('delete flow', () => {
    it('openDeleteConfirm should set userToDelete and clear any previous error', () => {
      component.openDeleteConfirm(mockUsers[0]);

      expect(component.userToDelete()).toEqual(mockUsers[0]);
      expect(component.deleteError()).toBe('');
    });

    it('cancelDelete should clear userToDelete and deleteError', () => {
      component.openDeleteConfirm(mockUsers[0]);
      component.cancelDelete();

      expect(component.userToDelete()).toBeNull();
      expect(component.deleteError()).toBe('');
    });

    it('confirmDelete should do nothing if no userToDelete is set', () => {
      component.confirmDelete();
      expect(userServiceSpy.deleteUser).not.toHaveBeenCalled();
    });

    it('confirmDelete should call deleteUser with the selected user id', () => {
      userServiceSpy.deleteUser.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: undefined }));
      component.openDeleteConfirm(mockUsers[0]);

      component.confirmDelete();

      expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(1);
    });

    it('confirmDelete should remove the user from both users() and filteredUsers() on success', () => {
      userServiceSpy.deleteUser.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: undefined }));
      component.openDeleteConfirm(mockUsers[0]); // Ahmed, id 1

      component.confirmDelete();

      expect(component.users().find(u => u.id === 1)).toBeUndefined();
      expect(component.filteredUsers().find(u => u.id === 1)).toBeUndefined();
      expect(component.users().length).toBe(2);
    });

    it('confirmDelete should clear userToDelete and isDeleting on success', () => {
      userServiceSpy.deleteUser.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: undefined }));
      component.openDeleteConfirm(mockUsers[0]);

      component.confirmDelete();

      expect(component.userToDelete()).toBeNull();
      expect(component.isDeleting()).toBe(false);
    });

    it('confirmDelete should re-apply active filters after a successful delete', () => {
      component.onRoleFilterChange('2'); // Ahmed + Sara visible
      userServiceSpy.deleteUser.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: undefined }));

      component.openDeleteConfirm(mockUsers[0]); // delete Ahmed
      component.confirmDelete();

      // Sara should remain visible since the Student filter is still active and Ahmed is gone
      expect(component.filteredUsers().map(u => u.id)).toEqual([2]);
    });

    it('confirmDelete should set deleteError and keep the user in the list on backend failure', () => {
      userServiceSpy.deleteUser.mockReturnValue(
        of({ isSuccess: false, statusCode: 400, errorMessages: ['Cannot delete: user has active records'], result: undefined })
      );
      component.openDeleteConfirm(mockUsers[0]);

      component.confirmDelete();

      expect(component.deleteError()).toBe('Cannot delete: user has active records');
      expect(component.users().find(u => u.id === 1)).toBeDefined();
      expect(component.isDeleting()).toBe(false);
    });

    it('confirmDelete should set a connection error message when the request errors out', () => {
      userServiceSpy.deleteUser.mockReturnValue(throwError(() => ({ error: null })));
      component.openDeleteConfirm(mockUsers[0]);

      component.confirmDelete();

      expect(component.deleteError()).toBe('Connection error. Please try again.');
      expect(component.isDeleting()).toBe(false);
    });

    it('confirmDelete should use the backend errorMessages from err.error when present', () => {
      userServiceSpy.deleteUser.mockReturnValue(
        throwError(() => ({ error: { errorMessages: ['Foreign key constraint'] } }))
      );
      component.openDeleteConfirm(mockUsers[0]);

      component.confirmDelete();

      expect(component.deleteError()).toBe('Foreign key constraint');
    });
  });
});
