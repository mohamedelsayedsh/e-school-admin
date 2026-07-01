import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AiAnalysisService } from './ai-analysis';
import { environment } from '../../../environments/environment';

describe('AiAnalysisService', () => {
  let service: AiAnalysisService;
  let httpMock: HttpTestingController;

  // A reusable mock file to use across tests
  const mockFile = new File(['dummy content'], 'test-file.png', { type: 'image/png' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AiAnalysisService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensures no outgoing requests are still pending
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('analyzeClassImage', () => {
    const endpointUrl = `${environment.apiUrl}/images/analyze-class`;

    it('should send a POST request with FormData containing the image', () => {
      service.analyzeClassImage(mockFile).subscribe();

      const req = httpMock.expectOne(endpointUrl);
      expect(req.request.method).toBe('POST');

      // Verify the body is FormData and contains the right key/file
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.body.get('image')).toEqual(mockFile);

      req.flush({});
    });

    it('should return the API response successfully', () => {
      const mockResponse = { success: true, analysisId: 123 };
      let actualResponse: any;

      service.analyzeClassImage(mockFile).subscribe((res) => {
        actualResponse = res;
      });

      const req = httpMock.expectOne(endpointUrl);
      req.flush(mockResponse);

      expect(actualResponse).toEqual(mockResponse);
    });

    it('should propagate HTTP errors', () => {
      let caughtError: any;

      service.analyzeClassImage(mockFile).subscribe({
        error: (err) => (caughtError = err)
      });

      const req = httpMock.expectOne(endpointUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      expect(caughtError.status).toBe(400);
    });
  });

  describe('analyzeVideo', () => {
    const endpointUrl = `${environment.apiUrl}/images/analyze-video`;
    const mockVideoFile = new File(['dummy video data'], 'test-video.mp4', { type: 'video/mp4' });

    it('should send a POST request with FormData containing the video file', () => {
      service.analyzeVideo(mockVideoFile).subscribe();

      const req = httpMock.expectOne(endpointUrl);
      expect(req.request.method).toBe('POST');

      // Verify the body is FormData and contains the right key ('file', not 'image')
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.body.get('file')).toEqual(mockVideoFile);

      req.flush({});
    });

    it('should return the API response successfully', () => {
      const mockResponse = { success: true, status: 'processing' };
      let actualResponse: any;

      service.analyzeVideo(mockVideoFile).subscribe((res) => {
        actualResponse = res;
      });

      const req = httpMock.expectOne(endpointUrl);
      req.flush(mockResponse);

      expect(actualResponse).toEqual(mockResponse);
    });

    it('should propagate HTTP errors', () => {
      let caughtError: any;

      service.analyzeVideo(mockVideoFile).subscribe({
        error: (err) => (caughtError = err)
      });

      const req = httpMock.expectOne(endpointUrl);
      req.flush('Payload Too Large', { status: 413, statusText: 'Payload Too Large' });

      expect(caughtError.status).toBe(413);
    });
  });
});
