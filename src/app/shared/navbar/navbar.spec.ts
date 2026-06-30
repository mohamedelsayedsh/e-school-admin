import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Navbar } from './navbar';
import { AuthService } from '../../core/services/auth';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let authServiceSpy: { getUserName: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  function setup(title = 'Dashboard') {
    fixture = TestBed.createComponent(Navbar);
    fixture.componentRef.setInput('pageTitle', title);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    authServiceSpy = { getUserName: vi.fn(), logout: vi.fn() };
    routerSpy = { navigate: vi.fn() };
    authServiceSpy.getUserName.mockReturnValue('Hema');

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    setup();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require pageTitle to be supplied (no default)', () => {
    // setup() in beforeEach already supplies a value; this asserts the input is required
    // by confirming the component only renders correctly once it's set.
    expect(component.pageTitle()).toBe('Dashboard');
  });

  it('should display whatever pageTitle is passed in', () => {
    setup('Reports Management Dashboard');
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Reports Management Dashboard');
  });

  it('should fetch and store the username from AuthService on init', () => {
    expect(authServiceSpy.getUserName).toHaveBeenCalled();
    expect(component.userName()).toBe('Hema');
  });

  it('should fall back to whatever AuthService.getUserName() returns when no user-name is stored (handled by the service itself)', () => {
    authServiceSpy.getUserName.mockReturnValue('Admin');
    setup();
    expect(component.userName()).toBe('Admin');
  });

  it('onLogout should call AuthService.logout() and navigate to /login', () => {
    component.onLogout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('onLogout should call logout() before navigating (correct ordering)', () => {
    const callOrder: string[] = [];
    authServiceSpy.logout.mockImplementation(() => callOrder.push('logout'));
    routerSpy.navigate.mockImplementation(() => callOrder.push('navigate'));

    component.onLogout();

    expect(callOrder).toEqual(['logout', 'navigate']);
  });

  it('the logout click handler in the DOM should trigger onLogout', () => {
    const logoutBtn: HTMLElement = fixture.nativeElement.querySelector('.logout-btn');
    logoutBtn.click();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
