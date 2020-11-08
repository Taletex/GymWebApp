import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TrainingModalComponent } from './components/training-modal/training-modal.component';
import { ExerciseModalComponent } from './components/exercise-modal/exercise-modal.component';
import { UserModalComponent } from './components/user-modal/user-modal.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';

export { TrainingModalComponent } from './components/training-modal/training-modal.component';
export { ExerciseModalComponent } from './components/exercise-modal/exercise-modal.component';
export { UserModalComponent } from './components/user-modal/user-modal.component';
export { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        TrainingModalComponent,
        ExerciseModalComponent,
        UserModalComponent,
        ConfirmationModalComponent
    ],
    exports: [
        TrainingModalComponent,
        ExerciseModalComponent,
        UserModalComponent, 
        ConfirmationModalComponent
    ]
})
export class SharedModule { }