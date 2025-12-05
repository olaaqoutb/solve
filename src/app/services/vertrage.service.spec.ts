import { TestBed } from '@angular/core/testing';

import { VertrageService } from './vertrage.service';

describe('VertrageService', () => {
  let service: VertrageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VertrageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
