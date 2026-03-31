import { TestBed } from '@angular/core/testing';

import { Auswertung2Service } from './auswertung2.service';

describe('Auswertung2Service', () => {
  let service: Auswertung2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auswertung2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
