import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from './_models';

import { slideInAnimation } from '@app/animations';
import { HttpService } from './_services/http-service/http-service.service';

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
  baseServerUrl = this.httpService.baseServerUrl;
  sidebarOptions = {bExpanded: true};
  unreadNotificationLength = 0;
  bLoading: boolean = false;

  constructor(public router: Router, private accountService: AccountService, public httpService: HttpService) {
    this.accountService.account.subscribe(
      x => { 
        this.account = x;
        this.unreadNotificationLength = (this.account.user.notifications.filter((n)=>{ return !n.bConsumed; })).length;
      });
  }

  logout() {
    this.accountService.logout();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }

  expandSidebar() {
    this.sidebarOptions.bExpanded = true;
  }
}
