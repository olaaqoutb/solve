import { TestBed } from '@angular/core/testing';

import { StempelzeitService } from './stempelzeit.service';

describe('StempelzeitService', () => {
  let service: StempelzeitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StempelzeitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
