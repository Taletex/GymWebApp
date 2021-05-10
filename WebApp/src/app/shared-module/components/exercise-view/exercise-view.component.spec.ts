import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseViewComponent } from './exercise-view.component';

describe('ExerciseViewComponent', () => {
  let component: ExerciseViewComponent;
  let fixture: ComponentFixture<ExerciseViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
