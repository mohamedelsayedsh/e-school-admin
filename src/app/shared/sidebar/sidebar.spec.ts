import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose exactly 7 nav items', () => {
  expect(component.navItems.length).toBe(7);
  });

  it('should include the expected routes in the expected order', () => {
    expect(component.navItems.map(i => i.route)).toEqual([
      '/dashboard',
      '/users',
      '/register',
      '/quizzes',
      '/ai-scanner',
      '/incidents',
      '/reports',
    ]);
  });

  it('every nav item should have a non-empty label and icon', () => {
    for (const item of component.navItems) {
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it('should render one link per nav item', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const links = compiled.querySelectorAll('.nav-links a');
    expect(links.length).toBe(component.navItems.length);
  });

  it('should render the correct label text for each link', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const links = compiled.querySelectorAll('.nav-links a');

    component.navItems.forEach((item, index) => {
      expect(links[index].textContent).toContain(item.label);
    });
  });

  it('should render the company name in the header', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('.logo-text')?.textContent).toContain('BRIGHT PATH');
  });
});
