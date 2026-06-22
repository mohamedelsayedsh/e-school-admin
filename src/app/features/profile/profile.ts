import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { ProfileOverview } from './profile-overview/profile-overview';
import { ProfileActivity } from './profile-activity/profile-activity';
import { UserService } from '../../core/services/user';
import { ParentStudentService } from '../../core/services/parent-student';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Navbar, ProfileOverview, ProfileActivity],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private parentStudentService = inject(ParentStudentService);
  private cdr = inject(ChangeDetectorRef);

  viewedUser: User | null = null;
  relatedUser: User | null = null;
  relationLabel = '';

  isParent = false;
  isStudent = false;
  isAdmin = false;

  isLoading = true;
  errorMessage = '';

  profileTitle = 'Profile';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = Number(params.get('id'));
      if (!userId) {
        this.errorMessage = 'Invalid user.';
        this.isLoading = false;
        return;
      }
      this.resetState();
      this.loadProfile(userId);
    });
  }

  private resetState() {
    this.viewedUser = null;
    this.relatedUser = null;
    this.relationLabel = '';
    this.isParent = false;
    this.isStudent = false;
    this.isAdmin = false;
    this.errorMessage = '';
    this.isLoading = true;
  }

  private loadProfile(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          const user = response.result;
          this.viewedUser = user;
          this.profileTitle = `${user.userName} — ${user.role?.roleName || 'User'}`;

          const roleName = user.role?.roleName?.toLowerCase();
          this.isParent = roleName === 'parent';
          this.isStudent = roleName === 'student';
          this.isAdmin = roleName === 'admin';

          if (this.isParent || this.isStudent) {
            this.loadRelatedUser(user);
            return;
          }
        } else {
          this.errorMessage = response.errorMessages?.join(', ') || 'Failed to load this profile.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Connection error while loading this profile.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadRelatedUser(viewedUser: User) {
    this.parentStudentService.getLinkedParentsStudents().subscribe({
      next: (response) => {
        if (!response.isSuccess || !response.result) {
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        if (this.isParent) {
          const link = response.result.find(l => l.parentId === viewedUser.id);
          if (link?.student) {
            this.relatedUser = link.student;
            this.relationLabel = 'Their Child';
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        }
        else if (this.isStudent) {
          const link = response.result.find(l => l.studentId === viewedUser.id);
          if (link) {
            this.userService.getUserById(link.parentId).subscribe({
              next: (parentResponse) => {
                if (parentResponse.isSuccess) {
                  this.relatedUser = parentResponse.result;
                  this.relationLabel = 'Their Parent';
                }
                this.isLoading = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            });
            return;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
