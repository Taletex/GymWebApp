import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MESSAGES } from '@app/_helpers';
import { Account, APP_PAGES, Role } from '@app/_models';
import { Notification } from '@app/_models/training-model';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { GeneralService, NOTIFICATION_TYPE, NOTIFICATION_TYPE_NAMES, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  
  @Input() sidebarOptions: any;
  public account: Account;
  public Role = Role;
  public unreadNotificationsLength: number;
  public unreadNotificationList: Notification[];
  public baseServerUrl = this.httpService.baseServerUrl;
  public bLoading = false;
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;
  public NOTIFICATION_TYPE_NAMES = NOTIFICATION_TYPE_NAMES;
  public APP_PAGES = APP_PAGES;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;

  constructor(private toastr: ToastrService, public router: Router, private accountService: AccountService, private httpService: HttpService, private generalService: GeneralService) {
    this.accountService.account.subscribe((x) => {
      this.account = x;
      this.unreadNotificationList = (this.account.user.notifications.filter(n => !n.bConsumed));
      this.unreadNotificationsLength = this.unreadNotificationList.length;
    });
  }

  ngOnInit(): void {
  }
  
  logout() {
    this.accountService.logout();
  }

  expandSidebar() {
    this.sidebarOptions.bExpanded = true;
  }

  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

  /* NOTIFICATIONS */
  acceptRequest(notification: Notification) {
    this.bLoading = true;
    this.httpService.acceptRequest(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("acceptRequest result data", data);
        this.toastr.success(MESSAGES.NOTIFICATION_ACCEPTED);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || String(error) || MESSAGES.NOTIFICATION_ACCEPTED_FAIL);
        console.log("acceptRequest error", error);
      });
  }

  refuseRequest(notification: Notification) {
    this.bLoading = true;
    this.httpService.refuseRequest(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("refuseRequest result data", data);
        this.toastr.success(MESSAGES.NOTIFICATION_REFUSED);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.NOTIFICATION_REFUSED_FAIL);
        console.log("refuseRequest error", error);
      });
  }

  
  dismissNotification(notification: Notification) {
    this.bLoading = true;
    this.httpService.dismissNotification(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("dismissNotification result data", data);
        this.toastr.success(MESSAGES.NOTIFICATION_DISMISSED);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.NOTIFICATION_DISMISSED_FAIL);
        console.log("dismissNotification error", error);
      });
  }

}
