import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Notification, User } from '@app/_models/training-model';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from '@app/_models';
import { NOTIFICATION_TYPE, NOTIFICATION_ONLY_DISMISS } from '@app/_services/general-service/general-service.service';
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
  private currentSortField: any;
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;


  constructor(private httpService: HttpService, private toastr: ToastrService, private accountService: AccountService) { 

    // Init account and notification list
    this.accountService.account.subscribe(x => {
      this.account = x

      // Update notification list
      if(this.sortListStatus != null && this.filters != null && this.filters != {}) {
        this.notificationList = _.orderBy(_.cloneDeep(this.account.user.notifications), ['bConsumed', 'creationDate'], ['asc', 'desc']);
        this.filterNotifications(null);
        this.sortListByField(this.currentSortField, true);
      }
    });
    
    // Init filters and sort status
    this.resetFilters();
    this.filterNotifications(null);
    this.resetSortStatus();
  }

  ngOnInit(): void {
  }


  /* FILTER FUNCTIONS */
  filterNotifications(event: any) {
    let filters = _.cloneDeep(this.filters);
    this.notificationList = _.orderBy(_.filter(this.account.user.notifications, function(e) {
      return (
        (filters.filterNotListType == 'consumed' ? e.bConsumed : (filters.filterNotListType == 'notConsumed' ? !e.bConsumed : true)) &&
        (filters.type != '' ? e.type.toLowerCase().includes(filters.type.toLowerCase()) : true) &&
        (filters.from.name != '' ? e.from.name.toLowerCase().includes(filters.from.name.toLowerCase()) : true) &&
        (filters.from.surname != '' ? e.from.surname.toLowerCase().includes(filters.from.surname.toLowerCase()) : true) &&
        (filters.message != '' ? e.message.toLowerCase().includes(filters.message.toLowerCase()) : true)
      );
    }), ['bConsumed', 'creationDate'], ['asc', 'desc'])
  }

  resetFilters() {
    this.filters = { filterNotListType: 'notConsumed', type: '', from: {name: '', surname: ''}, message: ''};
  }

  
  resetSortStatus() {
    this.sortListStatus = {type: null, from: null, message: null, bConsumed: null};
  }

  /**
     * Sort notification list by field
     * @param field field used to sort the list
     * @param bRepeatLastSort if true, the function repeats the last sort of the field passed as argument
     */
    sortListByField(field: string, bRepeatLastSort: boolean) {
      if(field != null) {
        let currentFieldStatus = this.sortListStatus[field];
        this.resetSortStatus();
        this.sortListStatus[field] = bRepeatLastSort ? currentFieldStatus : (currentFieldStatus == null ? true : !currentFieldStatus);
        this.notificationList = _.orderBy(this.notificationList, field, this.sortListStatus[field] ? 'asc' : 'desc');
        this.currentSortField = field;
      }
    }


  /* ACTIONS */
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

  
  dismissAllNotifications() {
    this.bLoading = true;
    this.httpService.dismissAllNotifications(this.account.user._id, this.account.user.notifications)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("dismissAllNotifications result data", data);
        this.toastr.success('Tutte le richieste sono state visualizzate!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di visualizzazione di tutte le richieste");
        console.log("dismissAllNotifications error", error);
      });
  }


  cancelNotification(notification: Notification) {
    this.bLoading = true;
    this.httpService.cancelNotification(this.account.user._id, notification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("cancelNotification result data", data);
        this.toastr.success('Richiesta cancellata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di cancellazione della richiesta");
        console.log("cancelNotification error", error);
      });
  }


  cancelAllNotifications() {
    this.bLoading = true;
    this.httpService.cancelAllNotifications(this.account.user._id, this.account.user.notifications)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("cancelAllNotifications result data", data);
        this.toastr.success('Tutte le richieste (visualizzate) sono state cancellate!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di cancellazione di tutte le richieste");
        console.log("cancelAllNotifications error", error);
      });
  }


  /* CHECK FUNCTIONS */
  canDismissAllNotifications():boolean {
    return (_.find(this.account.user.notifications, function(n) { return !n.bConsumed && NOTIFICATION_ONLY_DISMISS.includes(n.type); }) != undefined);
  }
  
  canCancelAllNotifications():boolean {
    return (_.find(this.account.user.notifications, function(n) { return n.bConsumed; }) != undefined);
  }
}
