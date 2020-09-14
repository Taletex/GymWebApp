import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services/account-service/account-service.service';

import { Account, Role } from '@app/_models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public bActiveList = {homepage: false, trainings: false, exercises: false, users: false, notifications: false, userprofile: false, admin: false};
  public bExpandedSidebar;
  public account: Account;
  public Role = Role;
  
  constructor(public router: Router, private accountService: AccountService) {
    this.bExpandedSidebar = true;
    this.bActiveList[(this.router.url).split('/')[1]] = true;
    this.accountService.account.subscribe(x => this.account = x);
  }

  ngOnInit() {
  }

}
