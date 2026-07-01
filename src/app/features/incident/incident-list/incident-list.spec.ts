import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IncidentList } from './incident-list';
import { IncidentService } from '../../../core/services/incident';
import { UserService } from '../../../core/services/user';
import { Incident } from '../../../core/models/incident';

describe('IncidentList', () => {
  let component: IncidentList;
  let fixture: ComponentFixture<IncidentList>;
  let incidentServiceSpy: { getAllIncidents: ReturnType<typeof vi.fn> };
  let userServiceSpy: { getAllUsers: ReturnType<typeof vi.fn> };

  const mockIncidents: Incident[] = [
    {
      analysisId: 1,
      studentId: 10,
      imageUrl: 'https://example.com/1.jpg',
      emotion: 'Sad',
      emotionConfidence: 0.8,
      behavior: 'Sleeping',
      behaviorConfidence: 0.9,
      createdAt: '2026-06-01T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    incidentServiceSpy = { getAllIncidents: vi.fn() };
    userServiceSpy = { getAllUsers: vi.fn() };

    userServiceSpy.getAllUsers.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: [{ id: 10, userName: 'Ahmed' }] })
    );
    incidentServiceSpy.getAllIncidents.mockReturnValue(
      of({ isSuccess: true, statusCode: 200, errorMessages: [], result: mockIncidents })
    );

    await TestBed.configureTestingModule({
      imports: [IncidentList],
      providers: [
        provideRouter([]),
        { provide: IncidentService, useValue: incidentServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate userMap and incidents after a successful fetch', () => {
    expect(component.userMap.get(10)).toBe('Ahmed');
    expect(component.incidents()).toEqual(mockIncidents);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('should still fetch incidents even if fetching users fails', () => {
    userServiceSpy.getAllUsers.mockReturnValue(throwError(() => new Error('users down')));

    const localFixture = TestBed.createComponent(IncidentList);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    expect(incidentServiceSpy.getAllIncidents).toHaveBeenCalled();
    expect(localComponent.incidents()).toEqual(mockIncidents);
  });

  it('should set errorMessage when the backend reports failure', () => {
    incidentServiceSpy.getAllIncidents.mockReturnValue(
      of({ isSuccess: false, statusCode: 400, errorMessages: ['Bad request'], result: null })
    );

    const localFixture = TestBed.createComponent(IncidentList);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    expect(localComponent.errorMessage()).toBe('Bad request');
    expect(localComponent.isLoading()).toBe(false);
  });

  it('should set a connection error message when the incidents request errors out', () => {
    incidentServiceSpy.getAllIncidents.mockReturnValue(throwError(() => new Error('network down')));

    const localFixture = TestBed.createComponent(IncidentList);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    expect(localComponent.errorMessage()).toBe('Connection error. Please try again.');
    expect(localComponent.isLoading()).toBe(false);
  });

  it('getStudentName should return the mapped name when known', () => {
    expect(component.getStudentName(10)).toBe('Ahmed');
  });

  it('getStudentName should fall back to "Student #id" when unknown', () => {
    expect(component.getStudentName(999)).toBe('Student #999');
  });

  it('openImageModal should set selectedImageUrl and open the modal', () => {
    component.openImageModal('https://example.com/test.jpg');

    expect(component.isImageModalOpen()).toBe(true);
    expect(component.selectedImageUrl()).toBe('https://example.com/test.jpg');
  });

  it('closeImageModal should reset the modal state', () => {
    component.openImageModal('https://example.com/test.jpg');
    component.closeImageModal();

    expect(component.isImageModalOpen()).toBe(false);
    expect(component.selectedImageUrl()).toBe('');
  });

  it('getFallbackImage should build a ui-avatars url using the student name', () => {
    const url = component.getFallbackImage(10);
    expect(url).toBe('https://ui-avatars.com/api/?name=Ahmed&background=e8ebf0&color=aaa');
  });

  it('getFallbackImage should replace spaces in the name with +', () => {
    component.userMap.set(20, 'Ahmed Hassan');
    const url = component.getFallbackImage(20);
    expect(url).toContain('name=Ahmed+Hassan');
  });
});
