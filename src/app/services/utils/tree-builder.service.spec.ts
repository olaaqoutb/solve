import { TestBed } from '@angular/core/testing';

import { TreeBuilderService } from './tree-builder.service';

describe('TreeBuilderService', () => {
  let service: TreeBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
