import { TestBed } from '@angular/core/testing';

import { TaetigkeitenHistorischService } from './taetigkeiten-historisch.service';

describe('TaetigkeitenHistorischService', () => {
  let service: TaetigkeitenHistorischService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaetigkeitenHistorischService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
