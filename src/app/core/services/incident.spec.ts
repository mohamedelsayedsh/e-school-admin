import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { IncidentService } from './incident';
import { environment } from '../../../environments/environment';

describe('IncidentService', () => {
  let service: IncidentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IncidentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllIncidents', () => {
    it('should send a GET to /images/analyses', () => {
      service.getAllIncidents().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/images/analyses`);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, result: [] });
    });

    it('should pass through whatever the backend returns', () => {
      const mockResponse = { isSuccess: true, result: [{ analysisId: 1, studentId: 5 }] };
      let actual: any;

      service.getAllIncidents().subscribe((res) => (actual = res));

      const req = httpMock.expectOne(`${environment.apiUrl}/images/analyses`);
      req.flush(mockResponse);

      expect(actual).toEqual(mockResponse);
    });

    it('should propagate an HTTP error to the caller', () => {
      let caughtError: any;

      service.getAllIncidents().subscribe({ error: (err) => (caughtError = err) });

      const req = httpMock.expectOne(`${environment.apiUrl}/images/analyses`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(caughtError.status).toBe(500);
    });

    it('should not send a body with the GET request', () => {
      service.getAllIncidents().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/images/analyses`);
      expect(req.request.body).toBeNull();
      req.flush({});
    });
  });

  describe('getIncidentById', () => {
    it('should send a GET to /images/analyses/:id with the correct id interpolated', () => {
      service.getIncidentById(42).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/images/analyses/42`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should build distinct urls for distinct ids (no caching/collision)', () => {
      service.getIncidentById(1).subscribe();
      service.getIncidentById(2).subscribe();

      httpMock.expectOne(`${environment.apiUrl}/images/analyses/1`).flush({});
      httpMock.expectOne(`${environment.apiUrl}/images/analyses/2`).flush({});
    });

    it('should propagate a 404 error for a non-existent id', () => {
      let caughtError: any;

      service.getIncidentById(999).subscribe({ error: (err) => (caughtError = err) });

      const req = httpMock.expectOne(`${environment.apiUrl}/images/analyses/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(caughtError.status).toBe(404);
    });
  });
});
