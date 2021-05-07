import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { LayoutComponent } from './layout.component';
import { SharedModule } from '@app/shared-module/shared.module';
import { UserModule } from '@app/user-module/user.module';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        ProfileRoutingModule,
        SharedModule,
        UserModule
    ],
    declarations: [
        LayoutComponent,
        ProfileDetailsComponent
    ]
})
export class ProfileModule { }