import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Account, Role } from '@app/_models';
import { Notification } from '@app/_models/training-model';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { NOTIFICATION_TYPE } from '@app/_services/general-service/general-service.service';
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
  public unreadNotificationLength: number;
  public unreadNotificationList: Notification[];
  public baseServerUrl = this.httpService.baseServerUrl;
  public bLoading = false;
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;

  constructor(private toastr: ToastrService, public router: Router, private accountService: AccountService, private httpService: HttpService) {
    this.accountService.account.subscribe((x) => {
      this.account = x;
      this.unreadNotificationList = (this.account.user.notifications.filter(n => !n.bConsumed));
      this.unreadNotificationLength = this.unreadNotificationList.length;
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

  /* NOTIFICATIONS */
  acceptRequest(notification: Notification) {
    this.bLoading = true;
    this.httpService.acceptRequest(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("acceptRequest result data", data);
        this.toastr.success('Richiesta correttamente accettata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di accettazione richiesta");
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
        this.toastr.success('Richiesta correttamente rifiutata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di rifiuto richiesta");
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
        this.toastr.success('Richiesta visualizzata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di visualizzazione richiesta");
        console.log("dismissNotification error", error);
      });
  }

}
