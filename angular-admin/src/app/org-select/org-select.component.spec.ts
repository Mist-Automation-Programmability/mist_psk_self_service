import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSelectComponent } from './org-select.component';

describe('OrgSelectComponent', () => {
  let component: OrgSelectComponent;
  let fixture: ComponentFixture<OrgSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
