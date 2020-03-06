import { TestBed } from '@angular/core/testing';

import { SidebarServiceService } from './sidebar-service.service';

describe('SidebarServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SidebarServiceService = TestBed.get(SidebarServiceService);
    expect(service).toBeTruthy();
  });
});
