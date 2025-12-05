import { TestBed } from '@angular/core/testing';

import { FreigabeHistorischService } from './freigabe-historisch.service';

describe('FreigabeHistorischService', () => {
  let service: FreigabeHistorischService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreigabeHistorischService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
