import { TestBed } from '@angular/core/testing';

import { TimeUtilityService } from './time-utility.service';

describe('TimeUtilityService', () => {
  let service: TimeUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
