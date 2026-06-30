import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ProfileOverview } from './profile-overview';
import { User } from '../../../core/models/user';

describe('ProfileOverview', () => {
  let component: ProfileOverview;
  let fixture: ComponentFixture<ProfileOverview>;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  const baseUser: User = {
    id: 1, userName: 'Ahmed', email: 'a@test.com', phoneNumber: '0100', roleID: 2,
    role: { roleID: 2, roleName: 'Student' },
  };

  function setup(overrides: Partial<{ user: User | null; relatedUser: User | null; relationLabel: string }> = {}) {
    fixture = TestBed.createComponent(ProfileOverview);
    fixture.componentRef.setInput('user', overrides.user !== undefined ? overrides.user : baseUser);
    if (overrides.relatedUser !== undefined) fixture.componentRef.setInput('relatedUser', overrides.relatedUser);
    if (overrides.relationLabel !== undefined) fixture.componentRef.setInput('relationLabel', overrides.relationLabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProfileOverview],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('should create when a user is provided', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should render the user name, role, email, and phone', () => {
    setup();
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.querySelector('h2')?.textContent).toContain('Ahmed');
    expect(compiled.textContent).toContain('Student');
    expect(compiled.textContent).toContain('a@test.com');
    expect(compiled.textContent).toContain('0100');
  });

  it('should show "N/A" fallbacks when email/phone are missing', () => {
    setup({ user: { ...baseUser, email: '', phoneNumber: '' } });
    const compiled: HTMLElement = fixture.nativeElement;

    const rows = compiled.querySelectorAll('.contact-row span');
    expect(rows[0].textContent).toContain('N/A');
    expect(rows[1].textContent).toContain('N/A');
  });

  it('should only render the className row when className is present', () => {
    setup({ user: { ...baseUser, className: 'Grade 5' } });
    let compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.textContent).toContain('Grade 5');

    setup({ user: baseUser }); // no className
    compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('.contact-row').length).toBe(2); // only email + phone rows
  });

  it('should NOT render the related-user card when relationLabel is empty', () => {
    setup({ relationLabel: '' });
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.querySelectorAll('.clickable-card').length).toBe(0);
  });

  it('should render the related-user card with details when relationLabel and relatedUser are both present', () => {
    const related: User = { id: 2, userName: 'ParentName', email: 'p@test.com', phoneNumber: '0101', roleID: 4 };
    setup({ relationLabel: 'Their Parent', relatedUser: related });
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('Their Parent');
    expect(compiled.textContent).toContain('ParentName');
    expect(compiled.textContent).toContain('p@test.com');
  });

  it('should show "No linked record found yet." when relationLabel is set but relatedUser is null', () => {
    setup({ relationLabel: 'Their Parent', relatedUser: null });
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('No linked record found yet.');
  });

  it('goToRelatedUser should navigate to /users/:id when a relatedUser is set', () => {
    const related: User = { id: 2, userName: 'ParentName', email: 'p@test.com', phoneNumber: '0101', roleID: 4 };
    setup({ relationLabel: 'Their Parent', relatedUser: related });

    component.goToRelatedUser();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', 2]);
  });

  it('goToRelatedUser should do nothing when there is no relatedUser', () => {
    setup({ relationLabel: 'Their Parent', relatedUser: null });

    component.goToRelatedUser();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
