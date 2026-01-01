import { TestBed } from '@angular/core/testing';

import { TimeOverlapService } from './time-overlap.service';

describe('TimeOverlapService', () => {
  let service: TimeOverlapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeOverlapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
