import { TestBed } from '@angular/core/testing';

import { ZivildienerService } from './zivildiener.service';

describe('ZivildienerService', () => {
  let service: ZivildienerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZivildienerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
