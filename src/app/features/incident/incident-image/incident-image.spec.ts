import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentImage } from './incident-image';

describe('IncidentImage', () => {
  let component: IncidentImage;
  let fixture: ComponentFixture<IncidentImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentImage],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentImage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
