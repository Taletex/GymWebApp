import { Component, OnInit } from '@angular/core';
import { Notification, User } from '@app/_models/training-model';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Account, Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { GeneralService, PAGEMODE, PAGES, NOTIFICATION_TYPE } from '@app/_services/general-service/general-service.service';
import * as _ from "lodash";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public originalUserList: Array<User> = [];
  public userList: Array<User> = [];
  public filters: any = {};
  public bLoading: boolean = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public newUser: User = new User();
  public account: Account;
  public Role = Role;
  public sortListStatus: any;
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;

  constructor(private router: Router, private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService, public generalService: GeneralService) {
    this.resetFilters();
    this.accountService.account.subscribe(x => this.account = x);
    
    // Init user list
    // TODO: Improvement. Settare una preferenza da salvare nel browser che definisce l'attuale ruolo dell'account
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

    // Init filters and sort status
    this.resetFilters();
    this.resetSortStatus();
  }

  ngOnInit() {}

  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
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
          console.log(this.userList);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the user list!');
          console.log(error.error.message);
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

        console.log(this.userList);
        this.bLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while loading the athlete list!');
        console.log(error.error.message);
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

        console.log(this.userList);
        this.bLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while loading the coach list!');
        console.log(error.error.message);
      });
  }
  
  /* createUser() {
    this.bLoading = true;
    this.httpService.createUser(this.newUser)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.userList.push(data);
          this.toastr.success('User successfully created!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while creating the user!');
          console.log(error.error.message);
        });
  } */

  /* deleteUser(id: string, index: number) {
    this.bLoading = true;
    this.httpService.deleteUser(id)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.userList.splice(index, 1);
          this.toastr.success('User successfully deleted!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while deleting the user!');
          console.log(error.error.message);
        });
  } */

  /* FILTER FUNCTIONS */
  filterUsers(event: any) {
    let filters = _.cloneDeep(this.filters);
    this.userList = _.filter(this.originalUserList, function(u) {
      return (
        (filters.name != '' ? u.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
        (filters.surname != '' ? u.surname.toLowerCase().includes(filters.surname.toLowerCase()) : true) &&
        (filters.userType != '' ? (u.userType.toLowerCase() == 'both' ? true : u.userType.toLowerCase().includes(filters.userType.toLowerCase())) : true) &&
        ((filters.dateOfBirth != null && filters.dateOfBirth != '') ? u.dateOfBirth.includes(filters.dateOfBirth) : true) &&
        (filters.sex != '' ? u.sex.toLowerCase().includes(filters.sex.toLowerCase()) : true) &&
        (filters.bodyWeight != null ? u.bodyWeight == filters.bodyWeight : true) &&
        (filters.yearsOfExperience != null ? u.yearsOfExperience == filters.yearsOfExperience : true)
      );
    });
  }

  resetFilters() {
    this.filters = { name: '', surname: '', userType: '', dateOfBirth: '', sex: '', bodyWeight: null, yearsOfExperience: null};
  }
 
  resetSortStatus() {
    this.sortListStatus = {name: null, variant: null, description: null};
  }

  sortListByField(field: string) {
    let currentFieldStatus = this.sortListStatus[field];
    this.resetSortStatus();
    this.sortListStatus[field] = currentFieldStatus == null ? true : !currentFieldStatus;

    if(field=='user')
      this.userList = _.orderBy(this.userList, ['name', 'surname'], this.sortListStatus[field] ? 'asc' : 'desc');
    else
      this.userList = _.orderBy(this.userList, field, this.sortListStatus[field] ? 'asc' : 'desc');
  }


  isCoachInUser(coach: User) {
    return (_.find(this.account.user.coaches, function(c) { return c._id == coach._id; }) != undefined);
  }

  isAthleteInUser(athlete: User) {
    return (_.find(this.account.user.athletes, function(a) { return a._id == athlete._id; }) != undefined);
  }

  isRequestYetSent(user: User) {
    return (_.find(user.notifications, function(n) { return n.from == this.account.user._id; }) != undefined);
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

    newNotification = new Notification(notificationType, this.account.user._id, notificationMessage);
    

    this.bLoading = true;
    this.httpService.sendNotification(destinationUser._id, newNotification)
    .subscribe(
      (data: any) => {
        console.log(data);
        destinationUser.notifications.push(newNotification);      // This is done to avoid retrieving again the list of user updated with the new notification (used to show/hide action buttons on the UI)
        this.bLoading = false;
        this.toastr.success('Richiesta correttamente inviata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
        console.log(error.error.message);
      });
  }

}
