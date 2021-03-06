import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* components */
import { ExerciseRoutingModule } from './exercise-routing.module';
import { LayoutComponent } from './layout.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { SharedModule } from '@app/shared-module/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        ExerciseRoutingModule,
        SharedModule,
        NgMultiSelectDropDownModule
    ],
    declarations: [
        LayoutComponent,
        ExercisesComponent,
        ExerciseComponent
    ]
})
export class ExerciseModule { }