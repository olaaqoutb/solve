import { TestBed } from '@angular/core/testing';

import { GetitRestService } from './getit-rest.service';

describe('GetitRestService', () => {
  let service: GetitRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetitRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
