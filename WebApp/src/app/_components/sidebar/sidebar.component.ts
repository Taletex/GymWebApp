import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services/account-service/account-service.service';

import { Account, Role } from '@app/_models';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';

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

  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  
  constructor(public router: Router, private accountService: AccountService, private generalService: GeneralService) {
    this.bExpandedSidebar = true;
    this.bActiveList[(this.router.url).split('/')[1]] = true;
    this.accountService.account.subscribe(x => this.account = x);
  }

  ngOnInit() {
  }
  
  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

}
