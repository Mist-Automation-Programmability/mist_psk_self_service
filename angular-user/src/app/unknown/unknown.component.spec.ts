import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnknownComponent } from './unknown.component';

describe('UnknownComponent', () => {
  let component: UnknownComponent;
  let fixture: ComponentFixture<UnknownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnknownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
