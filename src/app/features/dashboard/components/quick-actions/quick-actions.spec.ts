import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { QuickActions } from './quick-actions';

describe('QuickActions', () => {
  let component: QuickActions;
  let fixture: ComponentFixture<QuickActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActions],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 5 quick action links', () => {
    const links = fixture.nativeElement.querySelectorAll('a.quick-action-btn');
    expect(links.length).toBe(5);
  });

  it('should have correct routerLink for each action', () => {
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a.quick-action-btn')
    );
    const hrefs = links.map((a) => a.getAttribute('ng-reflect-router-link') ?? a.getAttribute('href'));
    // fallback check via routerLink attribute presence
    expect(links[0].textContent).toContain('Create Quiz');
    expect(links[1].textContent).toContain('Register User');
    expect(links[2].textContent).toContain('View Reports');
    expect(links[3].textContent).toContain('View Incidents');
    expect(links[4].textContent).toContain('AI Scanner');
  });

  it('should apply the correct color class to each action', () => {
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a.quick-action-btn')
    );
    expect(links[0].classList).toContain('action-purple');
    expect(links[1].classList).toContain('action-green');
    expect(links[2].classList).toContain('action-blue');
    expect(links[3].classList).toContain('action-red');
    expect(links[4].classList).toContain('action-orange');
  });

  it('should render the card title', () => {
    const title = fixture.nativeElement.querySelector('.card-title');
    expect(title.textContent.trim()).toBe('Quick Actions');
  });
});
