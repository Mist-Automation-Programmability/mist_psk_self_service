import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdfsComponent } from './adfs.component';

describe('AuthenticationComponent', () => {
  let component: AdfsComponent;
  let fixture: ComponentFixture<AdfsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdfsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdfsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
