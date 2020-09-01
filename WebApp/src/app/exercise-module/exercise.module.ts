import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ExerciseRoutingModule } from './exercise-routing.module';
import { LayoutComponent } from './layout.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { ExerciseModalComponent, SharedModule } from '@app/shared-module/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ExerciseRoutingModule,
        SharedModule
    ],
    declarations: [
        LayoutComponent,
        ExercisesComponent,
        ExerciseComponent
    ]
})
export class ExerciseModule { }