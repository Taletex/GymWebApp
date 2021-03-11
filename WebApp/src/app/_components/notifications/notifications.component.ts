import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Notification } from '@app/_models/training-model';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from '@app/_models';
import { NOTIFICATION_TYPE } from '@app/_services/general-service/general-service.service';
import * as _ from "lodash";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  public filters: any = {};
  public notificationList: Array<Notification> = [];
  public bLoading: boolean = false;
  public account: Account;
  public Role = Role;
  public sortListStatus: any;
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;


  constructor(private httpService: HttpService, private toastr: ToastrService, private accountService: AccountService) { 
    this.accountService.account.subscribe(x => {
      this.account = x
      this.notificationList = _.cloneDeep(this.account.user.notifications);
    });
    
    // Init filters and sort status
    this.resetFilters();
    this.resetSortStatus();
  }

  ngOnInit(): void {
  }


  /* FILTER FUNCTIONS */
  filterNotifications(event: any) {
    let filters = _.cloneDeep(this.filters);
    this.notificationList = _.filter(this.account.user.notifications, function(e) {
      return (
        (filters.type != '' ? e.type.toLowerCase().includes(filters.type.toLowerCase()) : true) &&
        (filters.from != '' ? e.from.toLowerCase().includes(filters.from.toLowerCase()) : true) &&
        (filters.message != '' ? e.message.toLowerCase().includes(filters.message.toLowerCase()) : true)
      );
    });
  }

  resetFilters() {
    this.filters = { type: '', from: '', message: ''};
  }

  
  resetSortStatus() {
    this.sortListStatus = {type: null, from: null, message: null};
  }

  sortListByField(field: string) {
    let currentFieldStatus = this.sortListStatus[field];
    this.resetSortStatus();
    this.sortListStatus[field] = currentFieldStatus == null ? true : !currentFieldStatus;
    this.notificationList = _.orderBy(this.notificationList, field, this.sortListStatus[field] ? 'asc' : 'desc');
  }


  /* ACTIONS */
  acceptRequest(notification: Notification, notificationIndex: number) {
    this.bLoading = true;
    this.httpService.acceptRequest(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        console.log(data);
        this.account.user.notifications.splice(notificationIndex, 1);      // This is done to avoid retrieving again the list of user updated with the new notification (used to show/hide action buttons on the UI)
        this.bLoading = false;
        this.toastr.success('Richiesta correttamente accettata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di accettazione richiesta");
        console.log(error);
      });
  }

  refuseRequest(notification: Notification, notificationIndex: number) {
    this.bLoading = true;
    this.httpService.refuseRequest(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        console.log(data);
        this.account.user.notifications.splice(notificationIndex, 1);      // This is done to avoid retrieving again the list of user updated with the new notification (used to show/hide action buttons on the UI)
        this.bLoading = false;
        this.toastr.success('Richiesta correttamente rifiutata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di rifiuto richiesta");
        console.log(error);
      });
  }

  
  dismissNotification(notification: Notification, notificationIndex: number) {
    this.bLoading = true;
    this.httpService.dismissNotification(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        console.log(data);
        this.account.user.notifications.splice(notificationIndex, 1);      // This is done to avoid retrieving again the list of user updated with the new notification (used to show/hide action buttons on the UI)
        this.bLoading = false;
        this.toastr.success('Richiesta visualizzata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di visualizzazione richiesta");
        console.log(error.error.message);
      });
  }

}
