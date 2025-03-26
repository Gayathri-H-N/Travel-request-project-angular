import { TestBed } from '@angular/core/testing';

import { EmployeeTravelService } from './employee-travel.service';

describe('EmployeeTravelService', () => {
  let service: EmployeeTravelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeTravelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
