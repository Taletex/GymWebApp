import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/_models/training-model';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from '@app/_models';
import { GeneralService, PAGEMODE, PAGES, PageStatus } from '@app/_services/general-service/general-service.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  public bLoading: boolean = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public pageStatus: PageStatus = new PageStatus();

  public user: User = new User();
  public account: Account;
  public Role = Role;

  constructor(private generalService: GeneralService, private router: Router, private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService) {
    let userId = (this.router.url).split('/')[2];
    this.bLoading = true;
    this.accountService.account.subscribe(x => this.account = x);

    this.httpService.getUser(userId)
      .subscribe(
        (data: any) => {
          this.user = data;
          this.bLoading = false;
          console.log(this.user);

          this.pageStatus = this.generalService.getPageStatus();
          console.log(this.pageStatus);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the user!');
          console.log(error.error.message);
        });
  }

  ngOnInit(): void {
  }

  changeMode(mode: PAGEMODE) {
    this.pageStatus[PAGES.USERS] = mode;
    this.generalService.setPageStatus(mode, PAGES.USERS);
  }

  saveUser() {
    this.bLoading = true;
    this.httpService.updateUser(this.user._id, this.user)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.user = data;
        this.toastr.success('User successfully updated!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while updating the user!');
        console.log(error.error.message);
      });
  }

  deleteUser() {
    this.bLoading = true;
    this.httpService.deleteUser(this.user._id)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.toastr.success('User successfully deleted!');
          this.router.navigate(['users']);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while deleting the user!');
          console.log(error.error.message);
        });
  }

}
