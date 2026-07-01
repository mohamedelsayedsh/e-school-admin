import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AiAnalysisService } from '../../core/services/ai-analysis';
import { Incident } from '../../core/models/incident';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { Spinner } from '../../shared/spinner/spinner';
import { UserService } from '../../core/services/user';
import { IncidentImage } from '../incident/incident-image/incident-image';
import { VideoAnalysisResponse } from '../../core/models/video-analysis';
import { ApiResponse } from '../../core/models/api-response';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-ai-scanner',
  imports: [CommonModule, Navbar, Spinner, IncidentImage],
  templateUrl: './ai-scanner.html',
  styleUrl: './ai-scanner.css',
})
export class AiScanner implements OnInit {
  private aiService = inject(AiAnalysisService);
  private userService = inject(UserService);

  activeTab = signal<'image' | 'video'>('image');
  selectedFile = signal<File | null>(null);

  isLoading = signal<boolean>(true);
  loadingMessage = signal<string>('Loading AI Workspace...');

  imageResults = signal<Incident[]>([]);
  videoResult = signal<VideoAnalysisResponse | null>(null);
  errorMessage = signal<string>('');

  // Normalizes the prediction into a safe [riot, normal] pair.
  // Handles both flat ([0.82, 0.21]) and nested ([[0.82, 0.21]]) API shapes,
  // and falls back to [0, 0] if anything is malformed — prevents NaN in the UI.
  private prediction = computed(() => {
    const raw = this.videoResult()?.prediction ?? [];
    const flat: unknown[] = Array.isArray(raw[0]) ? (raw[0] as unknown[]) : (raw as unknown[]);
    const nums = flat.map(Number);

    if (nums.length === 2 && nums.every((n) => !isNaN(n))) {
      return nums as [number, number];
    }
    return [0, 0] as [number, number];
  });

  riotProbability = computed(() => this.prediction()[0]);
  normalProbability = computed(() => this.prediction()[1]);
  predictionLabel = computed(() =>
    this.riotProbability() >= 0.5 ? 'Riot Detected' : 'Normal Activity'
  );

  isImageModalOpen = signal(false);
  selectedImageUrl = signal('');

  userMap = new Map<number, string>();

  hasRiot = computed(() => this.riotProbability() >= 0.5);

  riskColor = computed(() => (this.riotProbability() >= 0.5 ? '#dc2626' : '#16a34a'));

  riskLevel = computed(() => {
    const score = this.riotProbability();

    if (score >= 0.8) {
      return { text: 'High Risk', color: '#dc2626', badge: 'danger' };
    }
    if (score >= 0.5) {
      return { text: 'Medium Risk', color: '#f59e0b', badge: 'warning' };
    }
    return { text: 'Low Risk', color: '#16a34a', badge: 'success' };
  });

  recommendation = computed(() =>
    this.riotProbability() >= 0.5
      ? 'High probability of riot activity detected. Immediate review is recommended.'
      : 'No abnormal activity detected. Classroom appears safe.'
  );

  riotPercentage = computed(() => (this.riotProbability() * 100).toFixed(1));
  normalPercentage = computed(() => (this.normalProbability() * 100).toFixed(1));

  ngOnInit() {
    this.fetchUsers();

    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  fetchUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res: ApiResponse<User[]>) => {
        if (res.isSuccess && res.result) {
          res.result.forEach((user: any) => {
            this.userMap.set(user.id, user.userName);
          });
        }
      },
      error: (err) => console.error('Error fetching users:', err),
    });
  }

  getStudentName(studentId: number): string {
    return this.userMap.get(studentId) || `Student #${studentId}`;
  }

  getFallbackImage(studentId: number): string {
    const name = this.getStudentName(studentId).replace(/ /g, '+');
    return `https://ui-avatars.com/api/?name=${name}&background=e8ebf0&color=aaa`;
  }

  openImageModal(imageUrl: string) {
    this.selectedImageUrl.set(imageUrl);
    this.isImageModalOpen.set(true);
  }

  closeImageModal() {
    this.isImageModalOpen.set(false);
    this.selectedImageUrl.set('');
  }

  switchTab(tab: 'image' | 'video') {
    this.activeTab.set(tab);
    this.resetState();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  analyzeMedia() {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.loadingMessage.set(`Analyzing ${this.activeTab()} using AI models...`);

    this.errorMessage.set('');
    this.imageResults.set([]);
    this.videoResult.set(null);

    if (this.activeTab() === 'image') {
      this.aiService.analyzeClassImage(file).subscribe({
        next: (res: Incident[]) => {
          this.imageResults.set(res);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to analyze classroom snapshot.');
          this.isLoading.set(false);
        },
      });
    } else {
      this.aiService.analyzeVideo(file).subscribe({
        next: (res) => {
          // store raw response as-is; the `prediction` computed signal
          // handles normalizing/flattening it safely
          this.videoResult.set(res);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to analyze CCTV video.');
          this.isLoading.set(false);
        },
      });
    }
  }

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-success';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  resetState() {
    this.selectedFile.set(null);
    this.imageResults.set([]);
    this.videoResult.set(null);
    this.errorMessage.set('');
    this.closeImageModal();
  }
}
