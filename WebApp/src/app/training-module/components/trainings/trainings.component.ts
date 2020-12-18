import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Training, User } from '@app/_models/training-model';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Role } from '@app/_models';
import { TrainingService } from '@app/training-module/services/training-service/training-service.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent implements OnInit {
  public trainingList: Array<Training> = [];
  public athleteList: Array<User> = [];
  public newTraining: Training;
  public filters: any = {};
  public bLoading: boolean = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  
  // Account information
  account = this.accountService.accountValue;
  public Role = Role;


  constructor(private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService, public generalService: GeneralService, private trainingService: TrainingService) {
    this.filters = { author: { name: '', surname: '' }, creationDate: '', startDate: '', athlete: { name: '', surname: '' }, type: '' };
    
    // Init training list and athlete list
    this.getViewElements();

    // Init new training
    this.initNewTraining();
  }

  ngOnInit() {
  }

  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

  initNewTraining() {
    this.newTraining = new Training(this.account.user, this.account.user);
  }

  getViewElements() {
    this.bLoading = true;
    forkJoin({trainings: this.httpService.getTrainingsByUserId(this.account.user._id), athletes: this.httpService.getAthletes()})
      .subscribe(
        (data: any) => {
          this.trainingList = data.trainings;
          console.log(this.trainingList);

          this.athleteList = data.athletes;
          console.log(this.athleteList);

          this.bLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the training and athlete list.');
          console.log(error.error.message);
        });
  }

  createTraining() {
    this.bLoading = true;
    let t = this.trainingService.replaceTrainingEntitiesWithIds(this.newTraining);
    this.httpService.createTraining(t)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.trainingList.push(data);
          this.initNewTraining();
          this.toastr.success('Training successfully created.');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while creating the training.');
          console.log(error.error.message);
        });
  }

  deleteTraining(id: string, index: number) {
    this.bLoading = true;
    this.httpService.deleteTraining(id)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.trainingList.splice(index, 1);
          this.toastr.success('Training successfully deleted.');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while deleting the training.');
          console.log(error.error.message);
        });
  }

  /* IMPORT/EXPORT FUNCTIONS */
  exportTraining(training: Training) {
    this.trainingService.exportTraining(training);
    this.toastr.success("Training successfully exported.");
  }

  exportAllTrainings() {
    for(let i=0; i<this.trainingList.length; i++) {
      this.trainingService.exportTraining(this.trainingList[i]);
    }
    this.toastr.success("Trainings successfully exported.");
  }

}