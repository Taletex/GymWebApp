import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TrainingRoutingModule } from './training-routing.module';
import { LayoutComponent } from './layout.component';
import { TrainingComponent } from './components/training/training.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { TrainingLineChartComponent } from './components/training-line-chart/training-line-chart.component';
import { TrainingModalComponent, ExerciseModalComponent, SharedModule } from '@app/shared-module/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TrainingRoutingModule,
        SharedModule
    ],
    declarations: [
        LayoutComponent,
        TrainingsComponent,
        TrainingComponent,
        TrainingLineChartComponent
    ]
})
export class TrainingModule { }