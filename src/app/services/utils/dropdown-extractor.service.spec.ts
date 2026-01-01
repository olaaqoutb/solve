import { TestBed } from '@angular/core/testing';

import { DropdownExtractorService } from './dropdown-extractor.service';

describe('DropdownExtractorService', () => {
  let service: DropdownExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
