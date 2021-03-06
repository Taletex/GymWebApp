import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* components */
import { TrainingRoutingModule } from './training-routing.module';
import { LayoutComponent } from './layout.component';
import { TrainingComponent } from './components/training/training.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { TrainingLineChartComponent } from './components/training-line-chart/training-line-chart.component';
import { SharedModule } from '@app/shared-module/shared.module';
import { ChartsModule } from 'ng2-charts';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        TrainingRoutingModule,
        SharedModule,
        ChartsModule,
        EditorModule,
        NgMultiSelectDropDownModule.forRoot()
    ],
    declarations: [
        LayoutComponent,
        TrainingsComponent,
        TrainingComponent,
        TrainingLineChartComponent
    ]
})
export class TrainingModule { }