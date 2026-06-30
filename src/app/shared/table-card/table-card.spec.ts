import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { TableCard } from './table-card';

describe('TableCard', () => {
  let component: TableCard;
  let fixture: ComponentFixture<TableCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TableCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default title to an empty string', () => {
    expect(component.title()).toBe('');
  });

  it('should render a custom title when provided', () => {
    fixture.componentRef.setInput('title', 'Reports Registry');
    fixture.detectChanges();

    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Reports Registry');
  });
});

// --- Content projection tests, using a real host component since TestBed alone
// can't supply slotted content to a standalone component under test. ---
@Component({
  standalone: true,
  imports: [TableCard],
  template: `
    <app-table-card title="Host Title">
      <div table-actions class="my-actions">Filter controls</div>
      <p class="my-body">Table body content</p>
    </app-table-card>
  `,
})
class TableCardHost {}

describe('TableCard content projection', () => {
  let hostFixture: ComponentFixture<TableCardHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCardHost],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TableCardHost);
    hostFixture.detectChanges();
  });

  it('should project content tagged [table-actions] into the actions slot', () => {
    const compiled: HTMLElement = hostFixture.nativeElement;
    const actionsContainer = compiled.querySelector('.table-actions');

    expect(actionsContainer?.querySelector('.my-actions')).not.toBeNull();
    expect(actionsContainer?.textContent).toContain('Filter controls');
  });

  it('should project unmatched (default-slot) content into the body area', () => {
    const compiled: HTMLElement = hostFixture.nativeElement;
    const bodyContainer = compiled.querySelector('.table-responsive');

    expect(bodyContainer?.querySelector('.my-body')).not.toBeNull();
    expect(bodyContainer?.textContent).toContain('Table body content');
  });

  it('should render the title passed from the host', () => {
    const compiled: HTMLElement = hostFixture.nativeElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Host Title');
  });

  it('should NOT leak [table-actions] content into the default body slot', () => {
    const compiled: HTMLElement = hostFixture.nativeElement;
    const bodyContainer = compiled.querySelector('.table-responsive');

    expect(bodyContainer?.querySelector('.my-actions')).toBeNull();
  });
});
