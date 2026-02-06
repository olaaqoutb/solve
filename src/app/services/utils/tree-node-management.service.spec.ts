import { TestBed } from '@angular/core/testing';

import { TreeNodeManagementService } from './tree-node-management.service';

describe('TreeNodeManagementService', () => {
  let service: TreeNodeManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeNodeManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
