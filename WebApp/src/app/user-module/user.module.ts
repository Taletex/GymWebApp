import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* components */
import { UserRoutingModule } from './user-routing.module';
import { LayoutComponent } from './layout.component';
import { UserComponent } from './components/user/user.component';
import { UsersComponent } from './components/users/users.component';
import { SharedModule } from '@app/shared-module/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

export { UserComponent } from './components/user/user.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        UserRoutingModule,
        SharedModule,
        NgMultiSelectDropDownModule
    ],
    exports: [
        UserComponent
    ],
    declarations: [
        LayoutComponent,
        UsersComponent,
        UserComponent,
    ]
})
export class UserModule { }