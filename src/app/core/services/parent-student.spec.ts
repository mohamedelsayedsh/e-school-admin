import { ParentStudentService } from './parent-student';
import { TestBed } from '@angular/core/testing';


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
