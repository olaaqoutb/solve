import { TestBed } from '@angular/core/testing';

import { PersonenTwoService } from './personenTwo.service';

describe('Personen2Service', () => {
  let service: PersonenTwoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonenTwoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
