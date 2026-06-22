import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionEdit } from './action-edit';

describe('ActionEdit', () => {
  let component: ActionEdit;
  let fixture: ComponentFixture<ActionEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
