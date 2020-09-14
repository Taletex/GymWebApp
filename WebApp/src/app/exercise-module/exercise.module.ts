import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* components */
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
        NgbModule,
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