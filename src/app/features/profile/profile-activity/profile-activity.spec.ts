import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileActivity } from './profile-activity';

describe('ProfileActivity', () => {
  let component: ProfileActivity;
  let fixture: ComponentFixture<ProfileActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileActivity],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileActivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
