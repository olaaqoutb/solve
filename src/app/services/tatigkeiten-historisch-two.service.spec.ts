import { TestBed } from '@angular/core/testing';

import { TatigkeitenHistorischTwoService } from './tatigkeiten-historisch-two.service';

describe('TatigkeitenHistorischTwoService', () => {
  let service: TatigkeitenHistorischTwoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TatigkeitenHistorischTwoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
