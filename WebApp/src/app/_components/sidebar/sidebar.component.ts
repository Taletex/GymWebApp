import { Component, HostListener, Input, OnInit } from '@angular/core';
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

  @Input() options: any;

  public account: Account;
  public Role = Role;
  public unreadNotificationLength: number;

  // pagemode
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public bActiveList = {homepage: false, trainings: false, exercises: false, users: false, notifications: false, userprofile: false, admin: false};

  // responsiveness
  private lastWindowWidth: number;
  private triggerWidth: number = 767.98;

  constructor(public router: Router, private accountService: AccountService, private generalService: GeneralService) {
    this.bActiveList[(this.router.url).split('/')[1]] = true;
    this.accountService.account.subscribe(x => {
      this.account = x;
      this.unreadNotificationLength = (_.filter(this.account.user.notifications, function(n) { return !n.bConsumed; })).length;
    });

    
    // Init responsiveness aux
    this.lastWindowWidth = window.innerWidth;
  }

  ngOnInit() {
    if(!this.options || this.options.bExpanded == null) {
      this.options = {bExpanded: true};
      console.log("Sidebar options initialized inside sidebar component")
    }
    this.initExpandOption();
  }

  initExpandOption() {
    if(window.innerWidth <= 767.98) {
      this.options.bExpanded = false;
    }
  }
  
  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.initExpandOption();
    this.generalService.openPageWithMode(mode, page, id);
  } 

  // canSidebarBeExpanded() {
  //   return window.innerWidth > 575.98
  // }

  toggleSidebar() {
    this.options.bExpanded = !this.options.bExpanded;
  }

  @HostListener('window:resize', ['$event'])
  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  onResize(event) {
    let currentWidth = event.target.innerWidth;

    if(currentWidth < this.triggerWidth && this.lastWindowWidth >= this.triggerWidth)
      this.options.bExpanded = false;

    this.lastWindowWidth = currentWidth;
  }

}
