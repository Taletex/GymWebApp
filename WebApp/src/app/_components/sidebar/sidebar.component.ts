import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services/account-service/account-service.service';

import { Account, Role } from '@app/_models';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';
import * as _ from "lodash";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public bActiveList = {homepage: false, trainings: false, exercises: false, users: false, notifications: false, userprofile: false, admin: false};
  public bExpandedSidebar;
  public account: Account;
  public unreadNotificationLength: number;
  public Role = Role;

  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  
  constructor(public router: Router, private accountService: AccountService, private generalService: GeneralService) {
    this.bExpandedSidebar = true;
    this.bActiveList[(this.router.url).split('/')[1]] = true;
    this.accountService.account.subscribe(x => {
      this.account = x;
      this.unreadNotificationLength = (_.filter(this.account.user.notifications, function(n) { return !n.bConsumed; })).length;
    });
  }

  ngOnInit() {
  }
  
  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

  canSidebarBeExpanded() {
    return window.innerWidth > 575.98
  }

  toggleSidebar() {
    if(this.canSidebarBeExpanded())
      this.bExpandedSidebar = !this.bExpandedSidebar;
  }

}
