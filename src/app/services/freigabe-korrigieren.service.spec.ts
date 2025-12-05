import { TestBed } from '@angular/core/testing';

import { FreigabeKorrigierenService } from './freigabe-korrigieren.service';

describe('FreigabeKorrigierenService', () => {
  let service: FreigabeKorrigierenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreigabeKorrigierenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
