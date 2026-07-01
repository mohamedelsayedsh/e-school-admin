import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ReportService } from './report';
import { environment } from '../../../environments/environment';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/Report`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllReports', () => {
    it('should send a GET to /Report', () => {
      service.getAllReports().subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] });
    });

    it('should return the full reports array unmodified', () => {
      const mockReports = [{ id: 1, studentId: 10, weekNumber: 1 }];
      let actual: any;

      service.getAllReports().subscribe((res) => (actual = res));
      httpMock.expectOne(baseUrl).flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockReports });

      expect(actual.result).toEqual(mockReports);
    });

    it('should propagate a 500 error', () => {
      let caughtError: any;
      service.getAllReports().subscribe({ error: (err) => (caughtError = err) });

      httpMock.expectOne(baseUrl).flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(caughtError.status).toBe(500);
    });
  });

  describe('getReportById', () => {
    it('should send a GET to /Report/:id with the id interpolated correctly', () => {
      service.getReportById(15).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/15`);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] });
    });

    it('should build distinct urls for distinct ids', () => {
      service.getReportById(1).subscribe();
      service.getReportById(2).subscribe();

      httpMock.expectOne(`${baseUrl}/1`).flush({});
      httpMock.expectOne(`${baseUrl}/2`).flush({});
    });

    it('should propagate a 404 for a non-existent report id', () => {
      let caughtError: any;
      service.getReportById(9999).subscribe({ error: (err) => (caughtError = err) });

      httpMock.expectOne(`${baseUrl}/9999`).flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(caughtError.status).toBe(404);
    });
  });

  describe('updateReportAction', () => {
    it('should send a PATCH to /Report/:id with the update data as the body', () => {
      const updateData = { riskLevel: 'High', status: 'Approved', recomendations: 'Follow up weekly' };

      service.updateReportAction(5, updateData).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/5`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: null });
    });

    it('should send exactly the 3 expected fields and nothing extra', () => {
      const updateData = { riskLevel: 'Low', status: 'Pending', recomendations: 'Monitor' };

      service.updateReportAction(1, updateData).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(Object.keys(req.request.body).sort()).toEqual(['recomendations', 'riskLevel', 'status']);
      req.flush({});
    });

    it('should propagate an error if the patch fails', () => {
      let caughtError: any;
      service.updateReportAction(1, { riskLevel: 'Low', status: 'Pending', recomendations: '' })
        .subscribe({ error: (err) => (caughtError = err) });

      httpMock.expectOne(`${baseUrl}/1`).flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(caughtError.status).toBe(409);
    });
  });
});
