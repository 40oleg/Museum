import { TestBed } from '@angular/core/testing';

import { ConfigurationApiService } from './configuration-api.service';

describe('ConfigurationApiService', () => {
  let service: ConfigurationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
