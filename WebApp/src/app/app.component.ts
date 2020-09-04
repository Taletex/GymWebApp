import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GYM WEB APP';
  Role = Role;
  account: Account;

  constructor(public router: Router, private accountService: AccountService) { 
    this.accountService.account.subscribe(x => this.account = x);
  }

  logout() {
    this.accountService.logout();
}
}
