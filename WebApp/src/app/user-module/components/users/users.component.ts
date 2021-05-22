import { Component, HostListener, OnInit } from '@angular/core';
import { Notification, User } from '@app/_models/training-model';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Account, Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { GeneralService, PAGEMODE, PAGES, NOTIFICATION_TYPE } from '@app/_services/general-service/general-service.service';
import { Socket } from 'ngx-socket-io';
import * as _ from "lodash";
import { UserService } from '@app/user-module/services/user-service/user-service.service';
import { MESSAGES } from '@app/_helpers';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public originalUserList: Array<any> = [];
  public userList: Array<any> = [];
  public filters: any = {};
  public bLoading: boolean = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public newUser: User = new User();
  public account: Account;
  public Role = Role;
  public sortListStatus: any;
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;
  public baseServerUrl = this.httpService.baseServerUrl;
  private currentSortField: any;
  public bWindowOverMd: boolean;
  private lastWindowWidth: number;
  private triggerWidth: number = 767.98;

  constructor(private router: Router, private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService, public generalService: GeneralService, public userService: UserService, private socket: Socket) {
    this.resetFilters();
    this.accountService.account.subscribe(x => {
      this.account = x;
      
      // If users are filtered by "link", update the user list because somethink could have been changed
      if(this.filters.filterUserListType == "links") {
        this.originalUserList = _.sortBy(_.cloneDeep(this.account.user.athletes).concat(_.cloneDeep(this.account.user.coaches)), ['name', 'surname']);
        this.filterUsers(null);
        this.sortListByField(this.currentSortField, true);
      }
    });
    
    this.setUserList(null);

    // Init filters and sort status
    this.resetFilters();
    this.resetSortStatus();
    
    // Init responsiveness aux
    this.lastWindowWidth = window.innerWidth;
    this.initFiltersExpandability();

    // Socket events
    let scope = this;
    socket.on('userListUserUpdated', function(user) {
      if(user != null) {
        // Update user in user list
        let originalUserListUserIdx = _.findIndex(scope.originalUserList, function(u) { return u._id == user._id });
        let userListUserIdx = _.findIndex(scope.userList, function(u) { return u._id == user._id });

        if(originalUserListUserIdx != -1)
          scope.originalUserList[originalUserListUserIdx] = _.cloneDeep(user);

        if(userListUserIdx != -1)
          scope.userList[userListUserIdx] = _.cloneDeep(user);
        
        // Update user in current user link
        let athleteUserIdx = scope.account.user.athletes.findIndex((a) => { return a['_id'] == user._id });
        let coachUserIdx = scope.account.user.coaches.findIndex((c) => { return c['_id'] == user._id });
        if(athleteUserIdx != -1)
          scope.account.user.athletes[athleteUserIdx] = _.cloneDeep(user);
        if(coachUserIdx != -1)
          scope.account.user.coaches[coachUserIdx] = _.cloneDeep(user);
          
      }
    })
  }

  ngOnInit() {}

  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

  initFullUserList() {
    switch(this.account.user.userType) {
      case 'coach': {
        this.getAthletes();
        break;
      }
      case 'athlete': {
        this.getCoaches();
        break;
      }
      case 'both': {
        this.getUsers();
        break;
      }
    }
  }

  getUsers() {
    this.bLoading = true;

    this.httpService.getUsers()
      .subscribe(
        (data: any) => {
          this.originalUserList = data;
          this.userList = _.cloneDeep(this.originalUserList);
          this.resetFilters();

          this.bLoading = false;
          console.log("User List", this.userList);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error(String(error) || MESSAGES.USERS_GET_FAIL);
          console.log("Get User Error", error);
        });
  }

  getAthletes() {
    this.bLoading = true;

    this.httpService.getAthletes()
    .subscribe(
      (data: Array<User>) => {
        this.originalUserList = data;
        this.userList = _.cloneDeep(this.originalUserList);
        this.resetFilters();

        console.log("Athlete List", this.userList);
        this.bLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.ATHLETE_GET_FAIL);
        console.log("Get Athletes Error", error);
      });
  }

  getCoaches() {
    this.bLoading = true;

    this.httpService.getCoaches()
    .subscribe(
      (data: Array<User>) => {
        this.originalUserList = data;
        this.userList = _.cloneDeep(this.originalUserList);
        this.resetFilters();

        console.log("Coaches List", this.userList);
        this.bLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error(String(error) || MESSAGES.COACH_GET_FAIL);
        console.log("Get Coaches Error", error);
      });
  }

  // updateUserInUserLists(user: User) {
  //   let originalUserListUserIdx = _.findIndex(this.originalUserList, function(u) { return u._id == user._id });
  //   let userListUserIdx = _.findIndex(this.userList, function(u) { return u._id == user._id });

  //   if(originalUserListUserIdx != -1)
  //     this.originalUserList[originalUserListUserIdx] = _.cloneDeep(user);

  //   if(userListUserIdx != -1)
  //     this.userList[userListUserIdx] = _.cloneDeep(user);
  // }

  // updateUserInUserListsAfterLinkCancellation(user: User) {
  //   this.originalUserList[_.findIndex(this.originalUserList, function(u) { return u._id == user._id })] = _.cloneDeep(user);

  //   if(this.filters.filterUserListType == 'links')
  //     this.userList.splice(_.findIndex(this.userList, function(u) { return u._id == user._id }), 1);
  //   else
  //     this.userList[_.findIndex(this.userList, function(u) { return u._id == user._id })] = _.cloneDeep(user);
  // }

  /* FILTER FUNCTIONS */
  filterUsers(event: any) {
    let filters = _.cloneDeep(this.filters);
    this.userList = _.sortBy(_.filter(this.originalUserList, function(u) {
      return (
        (filters.name != '' ? u.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
        (filters.surname != '' ? u.surname.toLowerCase().includes(filters.surname.toLowerCase()) : true) &&
        (filters.userType != '' ? (u.userType.toLowerCase() == 'both' ? true : u.userType.toLowerCase().includes(filters.userType.toLowerCase())) : true) &&
        ((filters.dateOfBirth != null && filters.dateOfBirth != '') ? u.dateOfBirth.includes(filters.dateOfBirth) : true) &&
        (filters.sex != '' ? u.sex.toLowerCase().includes(filters.sex.toLowerCase()) : true) &&
        (filters.bodyWeight != null ? u.bodyWeight == filters.bodyWeight : true) &&
        (filters.yearsOfExperience != null ? u.yearsOfExperience == filters.yearsOfExperience : true)
      );
    }), ['name', 'surname'])
  }

  cancelFilters() {
    this.resetFilters();
    this.resetSortStatus();
    this.filterUsers(null);
  }

  areFiltersDirty(): boolean {
    return (this.filters.name != '' || this.filters.surname != '' || this.filters.userType != '' || this.filters.dateOfBirth != '' || this.filters.sex != '' || this.filters.bodyWeight != null || this.filters.yearsOfExperience != null);
  }

  setUserList(event: any) {
    if(this.filters.filterUserListType == 'links') {
      this.bLoading = true;
      this.originalUserList = _.sortBy(_.cloneDeep(this.account.user.athletes).concat(_.cloneDeep(this.account.user.coaches)), ['name', 'surname']);
      this.userList = _.cloneDeep(this.originalUserList);
      this.resetFilters();
      console.log("Linked User List", this.userList);
      this.bLoading = false;
    } else if(this.filters.filterUserListType == 'all') {
      this.initFullUserList();
    }
  }

  resetFilters() {
    let filterUserListType = (this.filters == null || this.filters.filterUserListType == null) ? 'links' : this.filters.filterUserListType;
    this.filters = { bExpanded: true, filterUserListType: filterUserListType, name: '', surname: '', userType: '', dateOfBirth: '', sex: '', bodyWeight: null, yearsOfExperience: null};
  }
 
  resetSortStatus() {
    this.sortListStatus = {name: null, variant: null, description: null};
  }

  /**
   * Sort user list by field
   * @param field field used to sort the list
   * @param bRepeatLastSort if true, the function repeats the last sort of the field passed as argument
   */
  sortListByField(field: string, bRepeatLastSort: boolean) {
    if(field != null) {
      let currentFieldStatus = this.sortListStatus[field];
      this.resetSortStatus();
  
      this.sortListStatus[field] = bRepeatLastSort ? currentFieldStatus : (currentFieldStatus == null ? true : !currentFieldStatus);
  
      if(field=='user')
        this.userList = _.orderBy(this.userList, ['name', 'surname'], this.sortListStatus[field] ? 'asc' : 'desc');
      else
        this.userList = _.orderBy(this.userList, field, this.sortListStatus[field] ? 'asc' : 'desc');
  
      this.currentSortField = field;
    }
  }

  sortListByFieldUI(field: string) {
    if(!this.bLoading) 
      this.sortListByField(field, false);
  }


  /* Notifications FUNCTIONS */
  sendNotification(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.sendNotification(notificationType, destinationUser, this.account)
    .then((data: any) => {
      this.bLoading = false;
      this.toastr.success(MESSAGES.NOTIFICATION_SENT);
    })
    .catch((error: any) => {
      this.bLoading = false;
      this.toastr.error(String(error) || MESSAGES.NOTIFICATION_SENT_FAIL);
    });
  }
  
  cancelAthleteCoachLink(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.cancelAthleteCoachLink(notificationType, destinationUser, this.account)
    .then((data: any) => {
      this.bLoading = false;
      this.toastr.success(MESSAGES.NOTIFICATION_SENT);
    })
    .catch((error: any) => {
      this.bLoading = false;
      this.toastr.error(String(error) || MESSAGES.NOTIFICATIONS_CANCEL_LINK_FAIL);
    });
  }

  cancelAthleteCoachLinkRequest(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.cancelAthleteCoachLinkRequest(notificationType, destinationUser)
    .then((data: any) => {
      this.bLoading = false;
      this.toastr.success(MESSAGES.NOTIFICATION_LINK_DISMISSED);
    })
    .catch((error: any) => {
      this.bLoading = false;
      this.toastr.error(String(error) || MESSAGES.NOTIFICATIONS_CANCEL_LINK_REQUEST_FAIL);
    });
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
