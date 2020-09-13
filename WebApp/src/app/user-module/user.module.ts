import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* components */
import { UserRoutingModule } from './user-routing.module';
import { LayoutComponent } from './layout.component';
import { UserComponent } from './components/user/user.component';
import { UsersComponent } from './components/users/users.component';
import { UserModalComponent, SharedModule } from '@app/shared-module/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UserRoutingModule,
        SharedModule
    ],
    declarations: [
        LayoutComponent,
        UsersComponent,
        UserComponent,
    ]
})
export class UserModule { }