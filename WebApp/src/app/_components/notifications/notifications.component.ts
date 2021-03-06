import { Component, HostListener, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Notification, User } from '@app/_models/training-model';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from '@app/_models';
import { NOTIFICATION_TYPE, NOTIFICATION_ONLY_DISMISS, NOTIFICATION_TYPE_NAMES } from '@app/_services/general-service/general-service.service';
import * as _ from "lodash";
import { MESSAGES } from '@app/_helpers';

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
  public NOTIFICATION_TYPE_NAMES = NOTIFICATION_TYPE_NAMES;
  public bWindowOverMd: boolean;
  private lastWindowWidth: number;
  private triggerWidth: number = 767.98;
  
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

    // Init responsiveness aux
    this.lastWindowWidth = window.innerWidth;
    this.initFiltersExpandability();
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
    this.filters = { bExpanded: true, filterNotListType: 'notConsumed', type: '', from: {name: '', surname: ''}, message: ''};
  }

  cancelFilters() {
    this.resetFilters();
    this.resetSortStatus();
    this.filterNotifications(null);
  }

  areFiltersDirty(): boolean {
    return (this.filters.filterNotListType != 'notConsumed' || this.filters.type != '' || this.filters.from.name != '' || this.filters.from.surname != '' || this.filters.message != '');
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

  sortListByFieldUI(field: string) {
    if(!this.bLoading)
      this.sortListByField(field, false);
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
        this.toastr.success(MESSAGES.NOTIFICATION_ACCEPTED);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.NOTIFICATION_ACCEPTED_FAIL);
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

  
  dismissAllNotifications() {
    this.bLoading = true;
    this.httpService.dismissAllNotifications(this.account.user._id, this.account.user.notifications)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update user and notification list because this is done using the socket!
        this.bLoading = false;
        console.log("dismissAllNotifications result data", data);
        this.toastr.success(MESSAGES.NOTIFICATIONS_DISMISSED);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.NOTIFICATIONS_DISMISSED_FAIL);
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
        this.toastr.success(MESSAGES.NOTIFICATION_CANCELED);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.NOTIFICATION_DELETE_FAIL);
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
        this.toastr.success(MESSAGES.NOTIFICATIONS_CANCELED);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.NOTIFICATIONS_DELETE_FAIL);
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


  /* responsiveness FUNCTIONS */
  initFiltersExpandability() {
    if(this.lastWindowWidth >= this.triggerWidth)
      this.filters.bExpanded = true;
    else if(this.lastWindowWidth < this.triggerWidth)
      this.filters.bExpanded = false;

    this.bWindowOverMd = this.filters.bExpanded;
  }

  @HostListener('window:resize', ['$event'])
  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  onResize(event) {
    let currentWidth = event.target.innerWidth;

    if(currentWidth < this.triggerWidth && this.lastWindowWidth >= this.triggerWidth)
      this.filters.bExpanded = this.bWindowOverMd = false;
    else if(currentWidth >= this.triggerWidth && this.lastWindowWidth < this.triggerWidth)
      this.filters.bExpanded = this.bWindowOverMd = true;

    this.lastWindowWidth = currentWidth;
  }
}
