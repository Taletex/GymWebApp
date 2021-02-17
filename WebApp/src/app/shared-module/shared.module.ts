import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TrainingModalComponent } from './components/training-modal/training-modal.component';
import { ExerciseModalComponent } from './components/exercise-modal/exercise-modal.component';
import { UserModalComponent } from './components/user-modal/user-modal.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { PageNotAuthorizedComponent } from './components/page-not-authorized/page-not-authorized.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

export { TrainingModalComponent } from './components/training-modal/training-modal.component';
export { ExerciseModalComponent } from './components/exercise-modal/exercise-modal.component';
export { UserModalComponent } from './components/user-modal/user-modal.component';
export { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
export { PageNotAuthorizedComponent } from './components/page-not-authorized/page-not-authorized.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule.forRoot()
    ],
    declarations: [
        TrainingModalComponent,
        ExerciseModalComponent,
        UserModalComponent,
        ConfirmationModalComponent,
        PageNotAuthorizedComponent
    ],
    exports: [
        TrainingModalComponent,
        ExerciseModalComponent,
        UserModalComponent, 
        ConfirmationModalComponent,
        PageNotAuthorizedComponent
    ]
})
export class SharedModule { }