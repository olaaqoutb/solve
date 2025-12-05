import { TestBed } from '@angular/core/testing';

import { OrganisationseinheitService } from './organisationseinheit.service';

describe('OrganisationseinheitService', () => {
  let service: OrganisationseinheitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganisationseinheitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
