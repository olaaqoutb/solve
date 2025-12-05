import { TestBed } from '@angular/core/testing';

import { PersonenService } from './personen.service';

describe('PersonenService', () => {
  let service: PersonenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
