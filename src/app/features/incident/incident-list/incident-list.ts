import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { IncidentService } from '../../../core/services/incident';
import { UserService } from '../../../core/services/user'; // <-- Add your UserService import
import { Router } from '@angular/router';
import { Incident } from '../../../core/models/incident';
import { CommonModule, DatePipe } from '@angular/common';
import { Navbar } from '../../../shared/navbar/navbar';
import { TableCard } from '../../../shared/table-card/table-card';
import { IncidentImage } from "../incident-image/incident-image";
import { Spinner } from '../../../shared/spinner/spinner';
// import { Spinner } from '../../../shared/spinner/spinner'; <-- Ensure your spinner is imported if standalone

@Component({
  selector: 'app-incident-list',
  imports: [CommonModule, Navbar, TableCard, DatePipe, IncidentImage, Spinner],
  templateUrl: './incident-list.html',
  styleUrl: './incident-list.css',
})
export class IncidentList implements OnInit {
  private incidentService = inject(IncidentService);
  private userService = inject(UserService); // <-- Injecting UserService
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  incidents: Incident[] = [];
  userMap = new Map<number, string>(); // <-- Map to store Student ID -> User Name
  isLoading = true;
  errorMessage = '';

  isImageModalOpen = false;
  selectedImageUrl = '';

  ngOnInit() {
    this.fetchData();
  }

  // Fetch users first to populate the map, then fetch incidents
  fetchData() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.result) {
          res.result.forEach((user: any) => {
            this.userMap.set(user.id, user.userName);
          });
        }
        this.fetchIncidents();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.fetchIncidents(); // Still fetch incidents even if users fail
      }
    });
  }

  fetchIncidents() {
    this.incidentService.getAllIncidents().subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.result) {
          this.incidents = res.result;
        } else {
          this.errorMessage = res.errorMessages?.join(', ') || 'Failed to load incidents.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching incidents:', err);
        this.errorMessage = 'Connection error. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Helper method to get the student name or fallback
  getStudentName(studentId: number): string {
    return this.userMap.get(studentId) || `Student #${studentId}`;
  }

  openImageModal(imageUrl: string) {
    this.selectedImageUrl = imageUrl;
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.isImageModalOpen = false;
    this.selectedImageUrl = '';
  }

  getEmotionClass(emotion: string): string {
    const dangerEmotions = ['Sad', 'Angry', 'Fear'];
    const successEmotions = ['Happy'];

    if (dangerEmotions.includes(emotion)) return 'risk-high';
    if (successEmotions.includes(emotion)) return 'status-approved';
    return 'status-pending'; // Default (Neutral, Surprise)
  }

  getBehaviorClass(behavior: string): string {
    const highRisk = ['Sleeping'];
    const mediumRisk = ['Looking Back', 'Standing'];
    const lowRisk = ['Writing', 'Reading', 'Looking Forward'];

    if (highRisk.includes(behavior)) return 'risk-high';
    if (mediumRisk.includes(behavior)) return 'risk-medium';
    if (lowRisk.includes(behavior)) return 'risk-low';
    return 'status-pending';
  }

  getFallbackImage(studentId: number): string {
    const name = this.getStudentName(studentId).replace(/ /g, '+');
    return `https://ui-avatars.com/api/?name=${name}&background=e8ebf0&color=aaa`;
  }
}
