import { TestBed } from '@angular/core/testing';

import { ManagerTravelService } from './manager-travel.service';

describe('ManagerTravelService', () => {
  let service: ManagerTravelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerTravelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
