import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecentIncidentsList } from './recent-incidents-list';

describe('RecentIncidentsList', () => {
  let component: RecentIncidentsList;
  let fixture: ComponentFixture<RecentIncidentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentIncidentsList],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentIncidentsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
