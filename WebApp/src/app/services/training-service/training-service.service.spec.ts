import { TestBed } from '@angular/core/testing';

import { DecoratorService } from './training-service.service';

describe('DecoratorService', () => {
  let service: DecoratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecoratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
