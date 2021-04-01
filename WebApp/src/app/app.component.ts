import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from './_models';

import { slideInAnimation } from '@app/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    slideInAnimation
  ]
})
export class AppComponent {
  title = 'My Training Platform';
  Role = Role;
  account: Account;

  constructor(public router: Router, private accountService: AccountService) {
    this.accountService.account.subscribe(x => this.account = x);
  }

  logout() {
    this.accountService.logout();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
