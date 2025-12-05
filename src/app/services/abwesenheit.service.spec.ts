import { TestBed } from '@angular/core/testing';

import { AbwesenheitService } from './abwesenheit.service';

describe('AbwesenheitService', () => {
  let service: AbwesenheitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbwesenheitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
