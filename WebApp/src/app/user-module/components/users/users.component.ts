import { Component, OnInit } from '@angular/core';
import { User } from '@app/_models/training-model';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Account, Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public userList: Array<User> = [];
  public filters: any = {};
  public bLoading: boolean = false;
  public newUser: User = new User();
  public account: Account;
  public Role = Role;

  constructor(private router: Router, private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService) {
    this.filters = { name: '', surname: '', dateOfBirth: '', sex: '', bodyWeight: '', yearsOfExperience: ''};
    this.accountService.account.subscribe(x => this.account = x);
    
    this.getUsers();
  }

  ngOnInit() {}

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
  
  createUser() {
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
  }

  deleteUser(id: string, index: number) {
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
  }

}