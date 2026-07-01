import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ParentStudentService } from './parent-student';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { ParentStudent } from '../models/parent-student';

describe('ParentStudentService', () => {
  let service: ParentStudentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ParentStudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensures that no requests are outstanding after each test
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLinkedParentsStudents', () => {
    const endpointUrl = `${environment.apiUrl}/parent-student/linked-parents-students`;

    it('should send a GET to /parent-student/linked-parents-students', () => {
      service.getLinkedParentsStudents().subscribe();

      const req = httpMock.expectOne(endpointUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, data: [] });
    });

    it('should pass through whatever the backend returns', () => {
      // Mocking a standard ApiResponse layout
      const mockResponse: ApiResponse<ParentStudent[]> = {
        isSuccess: true,
        message: 'Success',
        data: [] // Adjust this property based on your actual ApiResponse model ('data', 'result', etc.)
      } as any;

      let actual: any;

      service.getLinkedParentsStudents().subscribe((res) => (actual = res));

      const req = httpMock.expectOne(endpointUrl);
      req.flush(mockResponse);

      expect(actual).toEqual(mockResponse);
    });

    it('should propagate an HTTP error to the caller', () => {
      let caughtError: any;

      service.getLinkedParentsStudents().subscribe({
        error: (err) => (caughtError = err)
      });

      const req = httpMock.expectOne(endpointUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(caughtError.status).toBe(500);
    });

    it('should not send a body with the GET request', () => {
      service.getLinkedParentsStudents().subscribe();

      const req = httpMock.expectOne(endpointUrl);
      expect(req.request.body).toBeNull();
      req.flush({});
    });
  });
});
