import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AiScanner } from './ai-scanner';
import { AiAnalysisService } from '../../core/services/ai-analysis';
import { UserService } from '../../core/services/user';
import { Incident } from '../../core/models/incident';

describe('AiScanner', () => {
  let component: AiScanner;
  let fixture: ComponentFixture<AiScanner>;
  let aiServiceSpy: { analyzeClassImage: ReturnType<typeof vi.fn>; analyzeVideo: ReturnType<typeof vi.fn> };
  let userServiceSpy: { getAllUsers: ReturnType<typeof vi.fn> };

  const mockFile = new File(['dummy'], 'test.png', { type: 'image/png' });

  function setup() {
    fixture = TestBed.createComponent(AiScanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    aiServiceSpy = { analyzeClassImage: vi.fn(), analyzeVideo: vi.fn() };
    userServiceSpy = { getAllUsers: vi.fn() };

    userServiceSpy.getAllUsers.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: [{ id: 10, userName: 'Ahmed' }] })
    );

    await TestBed.configureTestingModule({
      imports: [AiScanner],
      providers: [
        { provide: AiAnalysisService, useValue: aiServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    setup();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to the "image" tab', () => {
    expect(component.activeTab()).toBe('image');
  });

  it('should populate userMap from UserService on init', () => {
    expect(component.userMap.get(10)).toBe('Ahmed');
  });

  it('getStudentName should fall back to "Student #id" for unmapped ids', () => {
    expect(component.getStudentName(999)).toBe('Student #999');
  });

  it('getFallbackImage should build a ui-avatars url from the student name', () => {
    const url = component.getFallbackImage(10);
    expect(url).toContain('name=Ahmed');
  });

  describe('switchTab', () => {
    it('should change activeTab and reset state', () => {
      component.selectedFile.set(mockFile);
      component.imageResults.set([{ analysisId: 1 } as Incident]);

      component.switchTab('video');

      expect(component.activeTab()).toBe('video');
      expect(component.selectedFile()).toBeNull();
      expect(component.imageResults()).toEqual([]);
    });
  });

  describe('onFileSelected', () => {
    it('should set selectedFile when a file is chosen', () => {
      const event = { target: { files: [mockFile] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.selectedFile()).toBe(mockFile);
    });

    it('should do nothing when no files are present', () => {
      const event = { target: { files: [] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.selectedFile()).toBeNull();
    });
  });

  describe('analyzeMedia — image tab', () => {
    beforeEach(() => {
      component.activeTab.set('image');
      component.selectedFile.set(mockFile);
    });

    it('should do nothing if no file is selected', () => {
      component.selectedFile.set(null);
      component.analyzeMedia();
      expect(aiServiceSpy.analyzeClassImage).not.toHaveBeenCalled();
    });

    it('should call analyzeClassImage and store results on success', () => {
      const mockIncidents: Incident[] = [
        { analysisId: 1, studentId: 10, imageUrl: 'x.jpg', emotion: 'Happy', emotionConfidence: 0.9, behavior: 'Reading', behaviorConfidence: 0.8, createdAt: '2026-01-01' },
      ];
      aiServiceSpy.analyzeClassImage.mockReturnValue(of(mockIncidents));

      component.analyzeMedia();

      expect(aiServiceSpy.analyzeClassImage).toHaveBeenCalledWith(mockFile);
      expect(component.imageResults()).toEqual(mockIncidents);
      expect(component.isLoading()).toBe(false);
    });

    it('should set errorMessage when analyzeClassImage fails', () => {
      aiServiceSpy.analyzeClassImage.mockReturnValue(throwError(() => new Error('fail')));

      component.analyzeMedia();

      expect(component.errorMessage()).toBe('Failed to analyze classroom snapshot.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('analyzeMedia — video tab', () => {
    beforeEach(() => {
      component.activeTab.set('video');
      component.selectedFile.set(mockFile);
    });

    it('should call analyzeVideo and store the raw response', () => {
      const mockResponse = { status: 'Success', source: 'Upload', filename: 'test.mp4', prediction: [[0.82, 0.21]] };
      aiServiceSpy.analyzeVideo.mockReturnValue(of(mockResponse));

      component.analyzeMedia();

      expect(aiServiceSpy.analyzeVideo).toHaveBeenCalledWith(mockFile);
      expect(component.videoResult()).toEqual(mockResponse);
      expect(component.isLoading()).toBe(false);
    });

    it('should set errorMessage when analyzeVideo fails', () => {
      aiServiceSpy.analyzeVideo.mockReturnValue(throwError(() => new Error('fail')));

      component.analyzeMedia();

      expect(component.errorMessage()).toBe('Failed to analyze CCTV video.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('prediction normalization', () => {
    function loadVideoResult(prediction: unknown) {
      component.activeTab.set('video');
      component.selectedFile.set(mockFile);
      aiServiceSpy.analyzeVideo.mockReturnValue(
        of({ status: 'Success', source: 'Upload', filename: 'test.mp4', prediction } as any)
      );
      component.analyzeMedia();
    }

    it('should flatten a nested prediction array, e.g. [[0.82, 0.21]]', () => {
      loadVideoResult([[0.82, 0.21]]);
      expect(component.riotProbability()).toBeCloseTo(0.82);
      expect(component.normalProbability()).toBeCloseTo(0.21);
    });

    it('should accept an already-flat prediction array, e.g. [0.3, 0.7]', () => {
      loadVideoResult([0.3, 0.7]);
      expect(component.riotProbability()).toBeCloseTo(0.3);
      expect(component.normalProbability()).toBeCloseTo(0.7);
    });

    it('should fall back to [0, 0] when prediction is empty', () => {
      loadVideoResult([]);
      expect(component.riotProbability()).toBe(0);
      expect(component.normalProbability()).toBe(0);
    });

    it('should fall back to [0, 0] when prediction contains non-numeric values', () => {
      loadVideoResult(['not', 'numbers']);
      expect(component.riotProbability()).toBe(0);
      expect(component.normalProbability()).toBe(0);
    });

    it('should fall back to [0, 0] when videoResult is null (no video analyzed yet)', () => {
      expect(component.riotProbability()).toBe(0);
      expect(component.normalProbability()).toBe(0);
    });
  });

  describe('derived risk computations', () => {
    function loadWithRiot(riot: number) {
      component.activeTab.set('video');
      component.selectedFile.set(mockFile);
      aiServiceSpy.analyzeVideo.mockReturnValue(
        of({ status: 'Success', source: 'Upload', filename: 'test.mp4', prediction: [[riot, 1 - riot]] } as any)
      );
      component.analyzeMedia();
    }

    it('hasRiot should be true when riotProbability >= 0.5', () => {
      loadWithRiot(0.6);
      expect(component.hasRiot()).toBe(true);
    });

    it('hasRiot should be false when riotProbability < 0.5', () => {
      loadWithRiot(0.3);
      expect(component.hasRiot()).toBe(false);
    });

    it('riskLevel should be "High Risk" when riotProbability >= 0.8', () => {
      loadWithRiot(0.85);
      expect(component.riskLevel().text).toBe('High Risk');
      expect(component.riskLevel().badge).toBe('danger');
    });

    it('riskLevel should be "Medium Risk" when riotProbability is between 0.5 and 0.8', () => {
      loadWithRiot(0.6);
      expect(component.riskLevel().text).toBe('Medium Risk');
      expect(component.riskLevel().badge).toBe('warning');
    });

    it('riskLevel should be "Low Risk" when riotProbability < 0.5', () => {
      loadWithRiot(0.2);
      expect(component.riskLevel().text).toBe('Low Risk');
      expect(component.riskLevel().badge).toBe('success');
    });

    it('predictionLabel should reflect "Riot Detected" vs "Normal Activity"', () => {
      loadWithRiot(0.9);
      expect(component.predictionLabel()).toBe('Riot Detected');

      loadWithRiot(0.1);
      expect(component.predictionLabel()).toBe('Normal Activity');
    });

    it('recommendation should change based on riot probability', () => {
      loadWithRiot(0.9);
      expect(component.recommendation()).toContain('Immediate review is recommended');

      loadWithRiot(0.1);
      expect(component.recommendation()).toContain('appears safe');
    });

    it('riotPercentage and normalPercentage should format as one-decimal percentages', () => {
      loadWithRiot(0.8247);
      expect(component.riotPercentage()).toBe('82.5');
    });
  });

  describe('image modal', () => {
    it('openImageModal should set the url and open the modal', () => {
      component.openImageModal('https://example.com/x.jpg');
      expect(component.isImageModalOpen()).toBe(true);
      expect(component.selectedImageUrl()).toBe('https://example.com/x.jpg');
    });

    it('closeImageModal should reset modal state', () => {
      component.openImageModal('https://example.com/x.jpg');
      component.closeImageModal();
      expect(component.isImageModalOpen()).toBe(false);
      expect(component.selectedImageUrl()).toBe('');
    });
  });

  describe('resetState', () => {
    it('should clear selectedFile, imageResults, videoResult, errorMessage, and close the modal', () => {
      component.selectedFile.set(mockFile);
      component.imageResults.set([{ analysisId: 1 } as Incident]);
      component.errorMessage.set('some error');
      component.openImageModal('x.jpg');

      component.resetState();

      expect(component.selectedFile()).toBeNull();
      expect(component.imageResults()).toEqual([]);
      expect(component.videoResult()).toBeNull();
      expect(component.errorMessage()).toBe('');
      expect(component.isImageModalOpen()).toBe(false);
    });
  });

  describe('statusClass', () => {
    it('should return bg-success for "Success"', () => {
      expect(component.statusClass('Success')).toBe('bg-success');
    });

    it('should return bg-danger for "Failed"', () => {
      expect(component.statusClass('Failed')).toBe('bg-danger');
    });

    it('should return bg-secondary for unrecognized status', () => {
      expect(component.statusClass('Pending')).toBe('bg-secondary');
    });

    it('should be case-insensitive', () => {
      expect(component.statusClass('SUCCESS')).toBe('bg-success');
    });
  });
});
