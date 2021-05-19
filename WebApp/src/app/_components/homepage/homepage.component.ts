import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { Account, Role } from '@app/_models';
import { forkJoin } from 'rxjs';
import { Training, TRAINING_STATES, USER_TYPES } from '@app/_models/training-model';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'
import * as _ from 'lodash';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  public account: Account;
  public trainingList: Training[];
  public trainingStatusLengthList: any;
  public TRAINING_STATES = TRAINING_STATES;
  bLoading: boolean = false;
  USER_TYPES = USER_TYPES;

  constructor(private router: Router, private httpService: HttpService, private accountService: AccountService, private toastr: ToastrService) { 
    this.accountService.account.subscribe(x => {
      this.account = x;
    });

    this.getViewElements();
  }

  ngOnInit(): void {
  }

  goToSection(section: string) {
    this.router.navigate([section]);
  }

  getViewElements() {
    this.bLoading = true;
    forkJoin({trainings: this.httpService.getTrainingsByUserId(this.account.user._id)})
      .subscribe(
        (data: any) => {
          this.trainingList = data.trainings;
          this.trainingStatusLengthList = _.countBy(this.trainingList, 'state');
          console.log(this.trainingStatusLengthList);
          console.log("Training List", this.trainingList);
          this.bLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('Si è verificato un errore durante il caricamento della homepage');
          console.log(error);
        });
  }
}
