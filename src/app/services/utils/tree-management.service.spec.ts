import { TestBed } from '@angular/core/testing';

import { TreeManagementService } from './tree-management.service';

describe('TreeManagementService', () => {
  let service: TreeManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
