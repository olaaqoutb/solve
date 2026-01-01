import { TestBed } from '@angular/core/testing';

import { TreeExpansionService } from './tree-expansion.service';

describe('TreeExpansionService', () => {
  let service: TreeExpansionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeExpansionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
