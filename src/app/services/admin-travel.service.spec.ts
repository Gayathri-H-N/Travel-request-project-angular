import { TestBed } from '@angular/core/testing';

import { AdminTravelService } from './admin-travel.service';

describe('AdminTravelService', () => {
  let service: AdminTravelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTravelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
