import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserService } from './user';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

describe('UserService',() => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/admin/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('should send a GET to /admin/users', () => {
      service.getAllUsers().subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: [] });
    });

    it('should return the user list from the response', () => {
      const mockUsers: User[] = [{ id: 1, userName: 'Ahmed', email: 'a@test.com', phoneNumber: '0100', roleID: 2 }];
      let actual: any;

      service.getAllUsers().subscribe((res) => (actual = res));
      httpMock.expectOne(baseUrl).flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockUsers });

      expect(actual.result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should send a GET to /admin/users/:id', () => {
      service.getUserById(5).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/5`);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: null });
    });

    it('should propagate a 404 for an unknown id', () => {
      let caughtError: any;
      service.getUserById(999).subscribe({ error: (err) => (caughtError = err) });

      httpMock.expectOne(`${baseUrl}/999`).flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(caughtError.status).toBe(404);
    });
  });

  describe('updateUser', () => {
    it('should send a PUT to the base /admin/users url (not /admin/users/:id) with the user as the body', () => {
      const user: User = { id: 1, userName: 'Ahmed Updated', email: 'a@test.com', phoneNumber: '0100', roleID: 2 };

      service.updateUser(user).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(user);
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: undefined });
    });

    it('should send the full user object including id in the body (since id is not in the URL)', () => {
      const user: User = { id: 42, userName: 'X', email: 'x@test.com', phoneNumber: '0100', roleID: 1 };

      service.updateUser(user).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.body.id).toBe(42);
      req.flush({});
    });
  });

  describe('deleteUser', () => {
    it('should send a DELETE to the base /admin/users url with id as a QUERY PARAM (not a path segment)', () => {
      service.deleteUser(7).subscribe();

      const req = httpMock.expectOne((r) => r.url === baseUrl && r.method === 'DELETE');
      expect(req.request.params.get('id')).toBe('7');
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: undefined });
    });

    it('should NOT append the id to the url path (this was a known backend quirk worked around here)', () => {
      service.deleteUser(7).subscribe();

      // Confirm it does NOT match the more "RESTful" /admin/users/7 pattern
      const matches = httpMock.match(`${baseUrl}/7`);
      expect(matches.length).toBe(0);

      // The actual request went to the base url with a query param instead
      const req = httpMock.expectOne((r) => r.url === baseUrl);
      req.flush({});
    });

    it('should propagate an error when delete fails (e.g. user has linked records)', () => {
      let caughtError: any;
      service.deleteUser(1).subscribe({ error: (err) => (caughtError = err) });

      const req = httpMock.expectOne((r) => r.url === baseUrl && r.method === 'DELETE');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(caughtError.status).toBe(409);
    });
  });

  describe('registerUser', () => {
    it('should send a POST to /user/register (a DIFFERENT base path than /admin/users)', () => {
      const data = { userName: 'New', email: 'new@test.com', password: 'Valid123!', phoneNumber: '01012345678', roleID: 2 };

      service.registerUser(data).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/user/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush({ isSuccess: true, statusCode: 200, errorMessages: [], result: null });
    });

    it('should NOT send the request to the /admin/users endpoint', () => {
      const data = { userName: 'New', email: 'new@test.com', password: 'Valid123!', phoneNumber: '01012345678', roleID: 2 };

      service.registerUser(data).subscribe();

      const matches = httpMock.match(baseUrl);
      expect(matches.length).toBe(0);

      httpMock.expectOne(`${environment.apiUrl}/user/register`).flush({});
    });

    it('should propagate a validation error from the backend', () => {
      let caughtError: any;
      service.registerUser({ userName: '', email: '', password: '', phoneNumber: '', roleID: 0 })
        .subscribe({ error: (err) => (caughtError = err) });

      httpMock.expectOne(`${environment.apiUrl}/user/register`).flush('Bad request', { status: 400, statusText: 'Bad Request' });

      expect(caughtError.status).toBe(400);
    });
  });
});
