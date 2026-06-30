import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileOverview } from './profile-overview';

describe('ProfileOverview', () => {
  let component: ProfileOverview;
  let fixture: ComponentFixture<ProfileOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
