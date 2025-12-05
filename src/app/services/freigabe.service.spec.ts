import { TestBed } from '@angular/core/testing';

import { FreigabeService } from './freigabe.service';

describe('FreigabeService', () => {
  let service: FreigabeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreigabeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
