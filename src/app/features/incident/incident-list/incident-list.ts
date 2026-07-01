import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IncidentService } from '../../../core/services/incident';
import { UserService } from '../../../core/services/user';
import { Incident } from '../../../core/models/incident';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../shared/navbar/navbar';
import { TableCard } from '../../../shared/table-card/table-card';
import { IncidentImage } from "../incident-image/incident-image";
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'app-incident-list',
  imports: [CommonModule, FormsModule, Navbar, TableCard, DatePipe, IncidentImage, Spinner],
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

  searchTerm = signal('');

  isImageModalOpen = signal(false);
  selectedImageUrl = signal('');

  filteredIncidents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.incidents();

    return this.incidents().filter((incident) => {
      const name = this.getStudentName(incident.studentId).toLowerCase();
      const id = incident.studentId.toString();
      return name.includes(term) || id.includes(term);
    });
  });

  ngOnInit() {
    this.fetchData();
  }

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
        this.fetchIncidents();
      }
    });
  }

  fetchIncidents() {
    this.incidentService.getAllIncidents().subscribe({
      next: (res: any) => {
        if (res.isSuccess === false) {
          this.errorMessage.set(res.errorMessages?.join(', ') || 'Failed to load incidents.');
          this.incidents.set([]);
          this.isLoading.set(false);
          return;
        }

        const incidentsData = res.result || res.data || (Array.isArray(res) ? res : []);

        if (incidentsData && incidentsData.length > 0) {
          this.incidents.set(incidentsData);
        } else {
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

  onSearchChange(value: string) {
    this.searchTerm.set(value);
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

  getFallbackImage(studentId: number): string {
    const name = this.getStudentName(studentId).replace(/ /g, '+');
    return `https://ui-avatars.com/api/?name=${name}&background=e8ebf0&color=aaa`;
  }
}
