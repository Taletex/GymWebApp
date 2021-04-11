import { Component, HostListener, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Training, TRAINING_STATES, User } from '@app/_models/training-model';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Role } from '@app/_models';
import { TrainingService } from '@app/training-module/services/training-service/training-service.service';
import { forkJoin } from 'rxjs';
import * as _ from "lodash";

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent implements OnInit {
  public TRAINING_STATES = TRAINING_STATES;
  public originalTrainingList: Array<Training> = [];
  public trainingList: Array<Training> = [];
  public athleteList: Array<any> = [];
  public newTraining: Training;
  public filters: any = {};
  public bLoading: boolean = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public sortListStatus: any;
  public bWindowOverMd: boolean;
  private lastWindowWidth: number;
  private triggerWidth: number = 767.98;
  
  // Account information
  public account = this.accountService.accountValue;
  public Role = Role;


  constructor(private accountService: AccountService, private httpService: HttpService, private toastr: ToastrService, public generalService: GeneralService, private trainingService: TrainingService) {
    // Init training list and athlete list
    this.getViewElements();

    // Init new training
    this.initNewTraining();

    // Init filters and sort status
    this.resetFilters();
    this.resetSortStatus();
    
    // Init responsiveness aux
    this.lastWindowWidth = window.innerWidth;
    this.initFiltersExpandability();
  }

  ngOnInit() {
  }

  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

  initNewTraining() {
    this.newTraining = new Training(this.account.user, [this.account.user]);
  }

  getViewElements() {
    this.bLoading = true;
    forkJoin({trainings: this.httpService.getTrainingsByUserId(this.account.user._id)})
      .subscribe(
        (data: any) => {
          this.originalTrainingList = data.trainings;
          this.trainingList = _.cloneDeep(_.orderBy(this.originalTrainingList, ['startDate', 'type'], ['desc', 'asc']));
          console.log("Training List", this.trainingList);
          
          this.resetFilters();

          this.athleteList = _.cloneDeep(this.account.user.athletes);
          this.athleteList.push(this.account.user);
          console.log("Atlete List", this.athleteList);

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
          this.originalTrainingList.push(data) 
          this.trainingList = _.cloneDeep(_.orderBy(this.originalTrainingList, ['startDate', 'type'], ['desc', 'asc']));
          this.resetFilters();

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
          this.originalTrainingList.splice(index, 1);
          this.trainingList = _.cloneDeep(_.orderBy(this.originalTrainingList, ['startDate', 'type'], ['desc', 'asc']));
          this.filterTrainings(null);
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
    for(let i=0; i<this.originalTrainingList.length; i++) {
      this.trainingService.exportTraining(this.originalTrainingList[i]);
    }
    this.toastr.success("Trainings successfully exported.");
  }


  /* FILTER FUNCTIONS */
  filterTrainings(event: any) {
    let filters = _.cloneDeep(this.filters);
    this.trainingList = _.filter(this.originalTrainingList, function(t) {
      return (
        (filters.author.name != '' ? t.author.name.toLowerCase().includes(filters.author.name.toLowerCase()) : true) &&
        (filters.author.surname != '' ? t.author.surname.toLowerCase().includes(filters.author.surname.toLowerCase()) : true) &&
        (filters.athlete.name != '' ? (_.find(t.athletes, function(a) { return a.name.toLowerCase().includes(filters.athlete.name.toLowerCase()) }) != undefined) : true) &&
        (filters.athlete.surname != '' ? (_.find(t.athletes, function(a) { return a.surname.toLowerCase().includes(filters.athlete.surname.toLowerCase()) }) != undefined) : true) &&
        (filters.type != '' ? t.type.toLowerCase().includes(filters.type.toLowerCase()) : true) &&
        ((filters.creationDate != null && filters.creationDate != '') ? t.creationDate.includes(filters.creationDate) : true) &&
        ((filters.startDate != null && filters.startDate != '') ? t.startDate.includes(filters.startDate) : true)
      );
    });
  }

  resetFilters() {
    this.filters = { bExpanded: true, author: { name: '', surname: '' }, creationDate: '', startDate: '', athlete: { name: '', surname: '' }, type: '' };
    this.initFiltersExpandability();
  }

  cancelFilters() {
    this.resetFilters();
    this.resetSortStatus();
    this.filterTrainings(null);
  }

  areFiltersDirty(): boolean {
    return (this.filters.author.name != '' || this.filters.author.surname != '' || this.filters.creationDate != '' || this.filters.startDate != '' || this.filters.athlete.name != '' || this.filters.athlete.surname != '' || this.filters.type != '');
  }

  resetSortStatus() {
    this.sortListStatus = {state: null, author: null, athletes: null, type: null, startDate: null, comment: null};
  }

  sortListByField(field: string) {
    let currentFieldStatus = this.sortListStatus[field];
    this.resetSortStatus();
    this.sortListStatus[field] = currentFieldStatus == null ? true : !currentFieldStatus;

    this.trainingList = _.orderBy(this.trainingList, field, this.sortListStatus[field] ? 'asc' : 'desc');
  }

  sortListByFieldUI(field: string) {
    if(!this.bLoading)
      this.sortListByField(field);
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