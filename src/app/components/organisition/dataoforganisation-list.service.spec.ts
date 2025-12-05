import { TestBed } from '@angular/core/testing';

import { DataoforganizationlistService } from './dataoforganisation-list.service';

describe('DataoforganizationlistService', () => {
  let service: DataoforganizationlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataoforganizationlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
