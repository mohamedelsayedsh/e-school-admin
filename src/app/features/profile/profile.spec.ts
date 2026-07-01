import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Profile } from './profile';
import { UserService } from '../../core/services/user';
import { ParentStudentService } from '../../core/services/parent-student';
import { User } from '../../core/models/user';
import { ParentStudent } from '../../core/models/parent-student';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let userServiceSpy: { getUserById: ReturnType<typeof vi.fn> };
  let parentStudentServiceSpy: { getLinkedParentsStudents: ReturnType<typeof vi.fn> };
  let paramMapSubject: Subject<any>;

  const studentUser: User = {
    id: 10, userName: 'Ahmed', email: 'a@test.com', phoneNumber: '0100', roleID: 2,
    role: { roleID: 2, roleName: 'Student' },
  };
  const parentUser: User = {
    id: 20, userName: 'ParentOfAhmed', email: 'p@test.com', phoneNumber: '0101', roleID: 4,
    role: { roleID: 4, roleName: 'Parent' },
  };
  const adminUser: User = {
    id: 30, userName: 'AdminUser', email: 'admin@test.com', phoneNumber: '0102', roleID: 1,
    role: { roleID: 1, roleName: 'Admin' },
  };

  function setup(initialId: string) {
    paramMapSubject = new Subject();
    return TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ParentStudentService, useValue: parentStudentServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMapSubject.asObservable() },
        },
      ],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(Profile);
      component = fixture.componentInstance;
      fixture.detectChanges();
      paramMapSubject.next(convertToParamMap({ id: initialId }));
    });
  }

  beforeEach(() => {
    userServiceSpy = { getUserById: vi.fn() };
    parentStudentServiceSpy = { getLinkedParentsStudents: vi.fn() };
  });

  it('should create', async () => {
    userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: adminUser }));
    await setup('30');
    expect(component).toBeTruthy();
  });

  it('should show "Invalid user." and not call the API when the id param is missing', async () => {
    await setup('');
    expect(component.errorMessage()).toBe('Invalid user.');
    expect(component.isLoading()).toBe(false);
    expect(userServiceSpy.getUserById).not.toHaveBeenCalled();
  });

  it('should load an admin profile, set isAdmin true, and NOT attempt a related-user lookup', async () => {
    userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: adminUser }));
    await setup('30');

    expect(component.viewedUser()).toEqual(adminUser);
    expect(component.isAdmin()).toBe(true);
    expect(component.isStudent()).toBe(false);
    expect(component.isParent()).toBe(false);
    expect(component.isLoading()).toBe(false);
    expect(parentStudentServiceSpy.getLinkedParentsStudents).not.toHaveBeenCalled();
    expect(component.profileTitle()).toBe('Profile Overview');
  });
  it('should set the error message and stop loading when the user fetch reports failure', async () => {
    userServiceSpy.getUserById.mockReturnValue(
      of({ isSuccess: false, statusCode: 404, errorMessages: ['User not found'], result: null })
    );
    await setup('999');

    expect(component.errorMessage()).toBe('User not found');
    expect(component.isLoading()).toBe(false);
  });

  it('should fall back to a generic message when the failure has no errorMessages', async () => {
    userServiceSpy.getUserById.mockReturnValue(
      of({ isSuccess: false, statusCode: 404, errorMessages: [], result: null })
    );
    await setup('999');

    expect(component.errorMessage()).toBe('Failed to load this profile.');
  });

  it('should set a connection error message when the user fetch itself errors out', async () => {
    userServiceSpy.getUserById.mockReturnValue(throwError(() => new Error('network down')));
    await setup('999');

    expect(component.errorMessage()).toBe('Connection error while loading this profile.');
    expect(component.isLoading()).toBe(false);
  });

  describe('Student profile with a linked parent', () => {
    const links: ParentStudent[] = [
      { parentId: 20, parent: parentUser, studentId: 10, student: studentUser },
    ];

    it('should resolve and attach the linked parent as relatedUser', async () => {
      userServiceSpy.getUserById.mockImplementation((id: number) =>
        id === 10
          ? of({ isSuccess: true, statusCode: 200, errorMessages: [], result: studentUser })
          : of({ isSuccess: true, statusCode: 200, errorMessages: [], result: parentUser })
      );
      parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(
        of({ isSuccess: true, statusCode: 200, errorMessages: [], result: links })
      );

      await setup('10');

      expect(component.isStudent()).toBe(true);
      expect(component.relatedUser()).toEqual(parentUser);
      expect(component.relationLabel()).toBe('Their Parent');
      expect(component.isLoading()).toBe(false);
    });

    it('should finish loading with no relatedUser when no link exists for this student', async () => {
      userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: studentUser }));
      parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(
        of({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] })
      );

      await setup('10');

      expect(component.relatedUser()).toBeNull();
      expect(component.relationLabel()).toBe('');
      expect(component.isLoading()).toBe(false);
    });

    it('should finish loading even if the second (parent) lookup fails', async () => {
      userServiceSpy.getUserById.mockImplementation((id: number) =>
        id === 10
          ? of({ isSuccess: true, statusCode: 200, errorMessages: [], result: studentUser })
          : throwError(() => new Error('parent lookup failed'))
      );
      parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(
        of({ isSuccess: true, statusCode: 200, errorMessages: [], result: links })
      );

      await setup('10');

      expect(component.relatedUser()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Parent profile with a linked student', () => {
    const links: ParentStudent[] = [
      { parentId: 20, parent: parentUser, studentId: 10, student: studentUser },
    ];

    it('should resolve and attach the linked student as relatedUser directly from the link payload', async () => {
      userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: parentUser }));
      parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(
        of({ isSuccess: true, statusCode: 200, errorMessages: [], result: links })
      );

      await setup('20');

      expect(component.isParent()).toBe(true);
      expect(component.relatedUser()).toEqual(studentUser);
      expect(component.relationLabel()).toBe('Their Child');
      expect(component.isLoading()).toBe(false);
      // Parent branch reads student straight off the link, no second HTTP call needed
      expect(userServiceSpy.getUserById).toHaveBeenCalledTimes(1);
    });

    it('should finish loading with no relatedUser when the link has no student attached', async () => {
      userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: parentUser }));
      parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(
        of({ isSuccess: true, statusCode: 200, errorMessages: [], result: [{ parentId: 20, parent: parentUser, studentId: 10, student: null }] })
      );

      await setup('20');

      expect(component.relatedUser()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });

    it('should finish loading when the linked-students lookup reports isSuccess: false', async () => {
      userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: parentUser }));
      parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(
        of({ isSuccess: false, statusCode: 500, errorMessages: [], result: null })
      );

      await setup('20');

      expect(component.relatedUser()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });

    it('should finish loading when the linked-students lookup itself errors out', async () => {
      userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: parentUser }));
      parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(throwError(() => new Error('lookup failed')));

      await setup('20');

      expect(component.relatedUser()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });
  });

  it('should fully reset state between two different navigations (no stale data leaking across users)', async () => {
    userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: adminUser }));
    await setup('30');

    expect(component.viewedUser()).toEqual(adminUser);
    expect(component.isAdmin()).toBe(true);

    // Now navigate to a student profile via the SAME route instance (paramMap re-emits)
    userServiceSpy.getUserById.mockReturnValue(of({ isSuccess: true, statusCode: 200, errorMessages: [], result: studentUser }));
    parentStudentServiceSpy.getLinkedParentsStudents.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] })
    );
    paramMapSubject.next(convertToParamMap({ id: '10' }));

    expect(component.viewedUser()).toEqual(studentUser);
    expect(component.isAdmin()).toBe(false); // must have been reset, not left true from the previous user
    expect(component.isStudent()).toBe(true);
  });
});
