import { ParentStudentService } from './parent-student';
import { TestBed } from '@angular/core/testing';

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ParentStudent', () => {
  let service: ParentStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParentStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
