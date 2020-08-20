import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from 'src/app/services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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

  constructor(private router: Router, private httpService: HttpService, private toastr: ToastrService) {
    this.filters = { name: '', surname: '', dateOfBirth: '', sex: '', bodyweight: '', yearsOfExperience: ''};
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
