import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdAdmission } from './ipd-admission';

describe('IpdAdmission', () => {
  let component: IpdAdmission;
  let fixture: ComponentFixture<IpdAdmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdAdmission],
    }).compileComponents();

    fixture = TestBed.createComponent(IpdAdmission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
