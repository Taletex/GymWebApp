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
import { SessionModalComponent } from './components/session-modal/session-modal.component';
import { WeekViewComponent } from './components/week-view/week-view.component';
import { SessionViewComponent } from './components/session-view/session-view.component';
import { TrainingViewComponent } from './components/training-view/training-view.component';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';
import { DragDropDirective } from './directives/drag-drop.directives'

export { TrainingModalComponent } from './components/training-modal/training-modal.component';
export { ExerciseModalComponent } from './components/exercise-modal/exercise-modal.component';
export { UserModalComponent } from './components/user-modal/user-modal.component';
export { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
export { SessionModalComponent } from './components/session-modal/session-modal.component';
export { PageNotAuthorizedComponent } from './components/page-not-authorized/page-not-authorized.component';
export { UploadFilesComponent } from './components/upload-files/upload-files.component';
export { DragDropDirective } from './directives/drag-drop.directives'

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
        PageNotAuthorizedComponent,
        SessionModalComponent,
        WeekViewComponent,
        SessionViewComponent,
        TrainingViewComponent,
        UploadFilesComponent,
        DragDropDirective
    ],
    exports: [
        TrainingModalComponent,
        ExerciseModalComponent,
        UserModalComponent, 
        ConfirmationModalComponent,
        PageNotAuthorizedComponent,
        SessionModalComponent,
        WeekViewComponent,
        SessionViewComponent,
        TrainingViewComponent,
        UploadFilesComponent,
        DragDropDirective
    ]
})
export class SharedModule { }