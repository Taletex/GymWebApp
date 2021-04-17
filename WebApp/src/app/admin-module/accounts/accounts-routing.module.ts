import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './components/account-list/list.component';
import { AccountComponent } from './components/account/account.component';

const routes: Routes = [
    { path: '', component: ListComponent },
    { path: ':id', component: AccountComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountsRoutingModule { }