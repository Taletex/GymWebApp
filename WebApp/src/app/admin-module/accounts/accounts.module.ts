import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { ListComponent } from './components/account-list/list.component';
import { AccountComponent } from './components/account/account.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountModalComponent } from './components/account-modal/account-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        AccountsRoutingModule
    ],
    declarations: [
        ListComponent,
        AccountComponent,
        AccountModalComponent
    ]
})
export class AccountsModule { }