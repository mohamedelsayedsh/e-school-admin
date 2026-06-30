import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecentReportsList } from './recent-reports-list';

describe('RecentReportsList', () => {
  let component: RecentReportsList;
  let fixture: ComponentFixture<RecentReportsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentReportsList],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentReportsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
