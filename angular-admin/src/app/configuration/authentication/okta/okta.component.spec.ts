import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OktaComponent } from './okta.component';

describe('OktaComponent', () => {
  let component: OktaComponent;
  let fixture: ComponentFixture<OktaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OktaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OktaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
