import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingLineChartComponent } from './training-line-chart.component';

describe('TrainingLineChartComponent', () => {
  let component: TrainingLineChartComponent;
  let fixture: ComponentFixture<TrainingLineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingLineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
