import { TestBed } from '@angular/core/testing';

import { UserGistsService } from './user-gists.service';

describe('UserGistsService', () => {
  let service: UserGistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserGistsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
