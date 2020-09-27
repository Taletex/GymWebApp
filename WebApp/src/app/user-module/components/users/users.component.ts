import { Component, OnInit } from '@angular/core';
import { User } from '@app/_models/training-model';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Account, Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public userList: Array<User> = [];
  public filters: any = {};
  public bLoading: boolean = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public newUser: User = new User();
  public account: Account;
  public Role = Role;

  constructor(private router: Router, private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService, public generalService: GeneralService) {
    this.filters = { name: '', surname: '', dateOfBirth: '', sex: '', bodyWeight: '', yearsOfExperience: ''};
    this.accountService.account.subscribe(x => this.account = x);
    
    // TODO: Improvement. Settare una preferenza da salvare nel browser che deifnisce l'attuale ruolo dell'account
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

  ngOnInit() {}

  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

  getUsers() {
    this.bLoading = true;

    this.httpService.getUsers()
      .subscribe(
        (data: any) => {
          this.userList = data;
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
        this.userList = data;
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
        this.userList = data;
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

}
