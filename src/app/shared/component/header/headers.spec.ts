import { TestBed } from '@angular/core/testing';

import { Headers } from './headers';

describe('Headers', () => {
  let service: Headers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Headers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
