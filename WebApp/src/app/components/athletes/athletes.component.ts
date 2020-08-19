import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from 'src/app/services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-athletes',
  templateUrl: './athletes.component.html',
  styleUrls: ['./athletes.component.scss']
})
export class AthletesComponent implements OnInit {
  public userList: Array<User> = [new User()];
  public filters: any = {};
  public bLoading: boolean = false;

  constructor(private httpService: HttpService, private toastr: ToastrService) {
    this.filters = { name: '', variant: {name: '', intensityCoefficient: 1}, description: ''};
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

}
