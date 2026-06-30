import { Component, inject, OnInit, signal } from '@angular/core';
import { IncidentService } from '../../../core/services/incident';
import { UserService } from '../../../core/services/user';
import { Incident } from '../../../core/models/incident';
import { CommonModule, DatePipe } from '@angular/common';
import { Navbar } from '../../../shared/navbar/navbar';
import { TableCard } from '../../../shared/table-card/table-card';
import { IncidentImage } from "../incident-image/incident-image";
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'app-incident-list',
  imports: [CommonModule, Navbar, TableCard, DatePipe, IncidentImage, Spinner],
  templateUrl: './incident-list.html',
  styleUrl: './incident-list.css',
})
export class IncidentList implements OnInit {
  private incidentService = inject(IncidentService);
  private userService = inject(UserService);

  incidents = signal<Incident[]>([]);
  userMap = new Map<number, string>();
  isLoading = signal(true);
  errorMessage = signal('');

  isImageModalOpen = signal(false);
  selectedImageUrl = signal('');

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.isSuccess && res.result) {
          res.result.forEach((user: any) => {
            this.userMap.set(user.id, user.userName);
          });
        }
        this.fetchIncidents();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.fetchIncidents();
      }
    });
  }

 fetchIncidents() {
    this.incidentService.getAllIncidents().subscribe({
      next: (res: any) => {
        // Add this log so you can see exactly what the Incident API returns
        console.log('Incident API Response:', res);

        // Make the parsing more flexible, exactly like we did in the Dashboard
        const incidentsData = res.result || res.data || (Array.isArray(res) ? res : []);

        if (incidentsData && incidentsData.length > 0) {
          this.incidents.set(incidentsData);
        } else {
          // If the array is genuinely empty, this will display the "No incidents" message
          this.incidents.set([]);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching incidents:', err);
        this.errorMessage.set('Connection error. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getStudentName(studentId: number): string {
    return this.userMap.get(studentId) || `Student #${studentId}`;
  }

  openImageModal(imageUrl: string) {
    this.selectedImageUrl.set(imageUrl);
    this.isImageModalOpen.set(true);
  }

  closeImageModal() {
    this.isImageModalOpen.set(false);
    this.selectedImageUrl.set('');
  }

  getEmotionClass(emotion: string): string {
    const dangerEmotions = ['Sad', 'Angry', 'Fear'];
    const successEmotions = ['Happy'];

    if (dangerEmotions.includes(emotion)) return 'risk-high';
    if (successEmotions.includes(emotion)) return 'status-approved';
    return 'status-pending';
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
