import { TestBed } from '@angular/core/testing';

import { TreeNodeService } from './tree-node.service';

describe('TreeNodeService', () => {
  let service: TreeNodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeNodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
