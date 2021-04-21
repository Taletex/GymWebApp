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
  private currentSortField: any;
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;
  public bWindowOverMd: boolean;
  private lastWindowWidth: number;
  private triggerWidth: number = 767.98;

  constructor(private router: Router, private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService, public generalService: GeneralService, private socket: Socket) {
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
          this.toastr.error('An error occurred while loading the user list!');
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
        this.toastr.error('An error occurred while loading the athlete list!');
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
        this.toastr.error('An error occurred while loading the coach list!');
        console.log("Get Coaches Error", error);
      });
  }

  updateUserInUserLists(user: User) {
    let originalUserListUserIdx = _.findIndex(this.originalUserList, function(u) { return u._id == user._id });
    let userListUserIdx = _.findIndex(this.userList, function(u) { return u._id == user._id });

    if(originalUserListUserIdx != -1)
      this.originalUserList[originalUserListUserIdx] = _.cloneDeep(user);

    if(userListUserIdx != -1)
      this.userList[userListUserIdx] = _.cloneDeep(user);
  }

  updateUserInUserListsAfterLinkCancellation(user: User) {
    this.originalUserList[_.findIndex(this.originalUserList, function(u) { return u._id == user._id })] = _.cloneDeep(user);

    if(this.filters.filterUserListType == 'links')
      this.userList.splice(_.findIndex(this.userList, function(u) { return u._id == user._id }), 1);
    else
      this.userList[_.findIndex(this.userList, function(u) { return u._id == user._id })] = _.cloneDeep(user);
  }

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


  isCoachInUser(coach: User) {
    return (_.find(this.account.user.coaches, function(c) { return c._id == coach._id; }) != undefined);
  }

  isAthleteInUser(athlete: User) {
    return (_.find(this.account.user.athletes, function(a) { return a._id == athlete._id; }) != undefined);
  }

  isCoachRequestYetSent(user: User) {
    let userId = this.account.user._id;
    return (
      (_.find(user.notifications, function(n) { return (!n.bConsumed && n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.from._id == userId); }) != undefined) ||                   // FROM CHECK: check user per user, if in its notification there is one COACH request from the current user 
      (_.find(this.account.user.notifications, function(n) { return (!n.bConsumed && n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.from._id == user._id); }) != undefined)     // DESTINATION CHECK: check in the current user if in its notification there is an ATHLETE request from user per user
    );

  }

  isAthleteRequestYetSent(user: User) {
    let userId = this.account.user._id;
    return (
      (_.find(user.notifications, function(n) { return (!n.bConsumed &&  n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.from._id == userId); }) != undefined) ||               // FROM CHECK: check user per user, if in its notification there is one ATHLETE request from the current user 
      (_.find(this.account.user.notifications, function(n) { return (!n.bConsumed &&  n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.from._id == user._id); }) != undefined)     // DESTINATION CHECK: check in the current user if in its notification there is a COACH request from user per user
      );
  }

  canCoachRequestBeSent(user: User) {
    return (
      (user._id != this.account.user._id) && 
      (user.userType == 'coach' || user.userType == 'both') && 
      (this.account.user.userType=='athlete' || this.account.user.userType == 'both') && 
      !this.isCoachInUser(user) && 
      !this.isCoachRequestYetSent(user)
    );
  }

  canAthleteRequestBeSent(user: User) {
    return (
      (user._id != this.account.user._id) && 
      (user.userType == 'athlete' || user.userType == 'both') && 
      (this.account.user.userType=='coach' || this.account.user.userType == 'both') && 
      !this.isAthleteInUser(user) && 
      !this.isAthleteRequestYetSent(user)
    );
  }

  /** 
   * Used to check if a cancel athlete to coach link can be sent (used to broke an existing link between athlete and coach, from athlete to coach). 
   * This kind of request can be sent to an user only if the user checked figures out in the coaches list of the current user  
   */
  canCancelAthleteToCoachLinkBeSent(user: User) {
    return (
      (user._id != this.account.user._id) &&
      (_.find(this.account.user.coaches, function(c) { return c._id == user._id; }) != undefined) 
    );
  }

  /** 
   * Used to check if a cancel coach to athlete link can be sent (used to broke an existing link between coach and athlete, from coach to athlete). 
   * This kind of request can be sent to an user only if the user checked figures out in the athlete list of the current user  
   */
  canCancelCoachToAthleteLinkBeSent(user: User) {
    return (
      (user._id != this.account.user._id) &&
      (_.find(this.account.user.athletes, function(a) { return a._id == user._id }) != undefined) 
    );
  }

  /** 
   * Used to check if a cancel athlete to coach link request can be sent (used to cancel a request to create a link between athlete and coach, from athlete to coach). 
   * This kind of request can be sent to an user only if the user checked figures out in a notification as destination and that notification is a coach_request  
   */
  canCancelAthleteToCoachLinkRequestBeSent(user: User) {
    return (
      (user._id != this.account.user._id) &&
      (_.find(user.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.destination._id == user._id }) != undefined) 
    )
  }

  /** 
   * Used to check if a cancel coach to athlete link request can be sent (used to cancel a request to create a link between coach and athlete, from coach to athlete). 
   * This kind of request can be sent to an user only if the user checked figures out in a notification as destination and that notification is an athlete_request  
   */
  canCancelCoachToAthleteLinkRequestBeSent(user: User) {
    return (
      (user._id != this.account.user._id) &&
      (_.find(user.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.destination._id == user._id }) != undefined)  
    )
  }


  sendNotification(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    let notificationMessage;
    let newNotification;

    switch(notificationType) {
      case NOTIFICATION_TYPE.ATHLETE_REQUEST:
        notificationMessage = "Richiesta Follow da Coach";
        break;
      case NOTIFICATION_TYPE.COACH_REQUEST:
        notificationMessage = "Richiesta Follow da Atleta";
        break;
    }

    newNotification = new Notification("", notificationType, this.account.user._id, destinationUser._id, notificationMessage, false, new Date()); // Note: id is empty because it is assigned from the back-end
    
    this.bLoading = true;
    this.httpService.sendNotification(destinationUser._id, newNotification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update any user because update is made using sockets
        this.bLoading = false;
        console.log("Send Notification destination User", data);
        this.toastr.success('Richiesta correttamente inviata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
        console.log("Send Notification Error", error);
      });
  }
  

  cancelAthleteCoachLink(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    let notificationMessage;
    let newNotification;

    switch(notificationType) {
      case NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK:
        notificationMessage = "Legame atleta-coach eliminato da parte dell'atleta " + this.account.user.name + " " + this.account.user.surname;
        break;
      case NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK:
        notificationMessage = "Legame coach-atleta eliminato da parte del coach " + this.account.user.name + " " + this.account.user.surname;
    }

    newNotification = new Notification("", notificationType, this.account.user._id, destinationUser._id, notificationMessage, false, new Date()); // Note: id is empty because it is assigned from the back-end
    
    this.bLoading = true;
    this.httpService.cancelAthleteCoachLink(destinationUser._id, newNotification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update any user because update is made using sockets
        this.bLoading = false;
        console.log("cancelAthleteCoachLink result data", data);
        this.toastr.success('Richiesta correttamente inviata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
        console.log("cancelAthleteCoachLink error", error);
      });
  }
  

  cancelAthleteCoachLinkRequest(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    let notification;

    // Find the notification which need to be canceled
    switch(notificationType) {
      case NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK_REQUEST:
        notification = _.find(destinationUser.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.destination._id == destinationUser._id })
        break;
      case NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK_REQUEST:
        notification =  _.find(destinationUser.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.destination._id == destinationUser._id });
        break
    }

    // Send the dismiss request
    this.bLoading = true;
    this.httpService.dismissNotification(destinationUser._id, notification)
    .subscribe(
      (data: any) => {
        // Note: this function doesn't need to update any user because update is made using sockets
        this.bLoading = false;
        console.log("dismissNotification result data", data);
        this.toastr.success('Richiesta di collegamento correttamente eliminata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'eliminazione della richiesta di collegamento!");
        console.log("dismissNotification error", error);
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
