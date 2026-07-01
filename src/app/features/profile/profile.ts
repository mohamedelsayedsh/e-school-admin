import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { ProfileOverview } from './profile-overview/profile-overview';
import { ProfileActivity } from './profile-activity/profile-activity';
import { UserService } from '../../core/services/user';
import { ParentStudentService } from '../../core/services/parent-student';
import { User } from '../../core/models/user';
import { Spinner } from "../../shared/spinner/spinner";
import { BackButton } from "../../shared/back-button/back-button";

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Navbar, ProfileOverview, ProfileActivity, Spinner, BackButton],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private parentStudentService = inject(ParentStudentService);

  viewedUser = signal<User | null>(null);
  relatedUser = signal<User | null>(null);
  relationLabel = signal('');

  profileTitle = signal('Profile Overview')
  isParent = signal(false);
  isStudent = signal(false);
  isAdmin = signal(false);

  isLoading = signal(true);
  errorMessage = signal('');


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = Number(params.get('id'));
      if (!userId) {
        this.errorMessage.set('Invalid user.');
        this.isLoading.set(false);
        return;
      }
      this.resetState();
      this.loadProfile(userId);
    });
  }

  private resetState() {
    this.viewedUser.set(null);
    this.relatedUser.set(null);
    this.relationLabel.set('');
    this.isParent.set(false);
    this.isStudent.set(false);
    this.isAdmin.set(false);
    this.errorMessage.set('');
    this.isLoading.set(true);
  }

  private loadProfile(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          const user = response.result;
          this.viewedUser.set(user);

          const roleName = user.role?.roleName?.toLowerCase();
          const isParent = roleName === 'parent';
          const isStudent = roleName === 'student';
          this.isParent.set(isParent);
          this.isStudent.set(isStudent);
          this.isAdmin.set(roleName === 'admin');

          if (isParent || isStudent) {
            this.loadRelatedUser(user);
            return;
          }
        } else {
          this.errorMessage.set(response.errorMessages?.join(', ') || 'Failed to load this profile.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Connection error while loading this profile.');
        this.isLoading.set(false);
      }
    });
  }

  private loadRelatedUser(viewedUser: User) {
    this.parentStudentService.getLinkedParentsStudents().subscribe({
      next: (response) => {
        if (!response.isSuccess || !response.result) {
          this.isLoading.set(false);
          return;
        }

        if (this.isParent()) {
          const link = response.result.find(l => l.parentId === viewedUser.id);
          if (link?.student) {
            this.relatedUser.set(link.student);
            this.relationLabel.set('Their Child');
          }
          this.isLoading.set(false);
        }
        else if (this.isStudent()) {
          const link = response.result.find(l => l.studentId === viewedUser.id);
          if (link) {
            this.userService.getUserById(link.parentId).subscribe({
              next: (parentResponse) => {
                if (parentResponse.isSuccess) {
                  this.relatedUser.set(parentResponse.result);
                  this.relationLabel.set('Their Parent');
                }
                this.isLoading.set(false);
              },
              error: () => {
                this.isLoading.set(false);
              }
            });
            return;
          }
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
