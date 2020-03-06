import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaximumComponent } from './maximum.component';

describe('MaximumComponent', () => {
  let component: MaximumComponent;
  let fixture: ComponentFixture<MaximumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaximumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaximumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
