import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Account, Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public account: Account;
  public Role = Role;
  public unreadNotificationLength: number;
  public baseServerUrl = this.httpService.baseServerUrl;

  constructor(public router: Router, private accountService: AccountService, private httpService: HttpService) {
    this.accountService.account.subscribe(x => {
      this.account = x;
      this.unreadNotificationLength = (this.account.user.notifications.filter(n => !n.bConsumed)).length;
    });
  }

  ngOnInit(): void {
  }
  
  logout() {
    this.accountService.logout();
  }

}
