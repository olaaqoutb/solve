import { TestBed } from '@angular/core/testing';

import { PersonListServiceService } from './person-list-service.service';

describe('PersonListServiceService', () => {
  let service: PersonListServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonListServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
