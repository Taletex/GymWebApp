import { Component, HostListener, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Exercise } from '@app/_models/training-model';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from '@app/_models';
import * as _ from "lodash";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss']
})
export class ExercisesComponent implements OnInit {
  public originalExerciseList: Array<Exercise> = [];
  public exerciseList: Array<Exercise> = [];
  public filters: any = {};
  public bLoading: boolean = false;
  public newExercise: Exercise = new Exercise();
  public account: Account;
  public Role = Role;
  public sortListStatus: any;
  public bWindowOverMd: boolean;
  private lastWindowWidth: number;
  private triggerWidth: number = 767.98;


  constructor(private httpService: HttpService, private toastr: ToastrService, private accountService: AccountService) { 
    this.accountService.account.subscribe(x => this.account = x);
    
    // Init exercise list 
    this.getExercises();

    // Init new exercise
    this.initNewExercise();

    // Init filters and sort status
    this.resetFilters();
    this.resetSortStatus();

    // Init responsiveness aux
    this.lastWindowWidth = window.innerWidth;
    this.initFiltersExpandability();
  }

  ngOnInit(): void {
  }

  getExercises() {
    this.bLoading = true;
    this.httpService.getExercisesForUser(this.account.user._id)
      .subscribe(
        (data: any) => {
          this.originalExerciseList = data;
          this.exerciseList = _.cloneDeep(_.sortBy(this.originalExerciseList, ['name', 'variant.name']));
          this.resetFilters();
          
          this.bLoading = false;
          console.log(this.exerciseList);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the exercise list!');
          console.log(error.error.message);
        });
  }

  createExercise() {
    this.bLoading = true;
    this.httpService.createExercise(this.newExercise)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          
          this.originalExerciseList.push(data);
          this.exerciseList = _.cloneDeep(_.sortBy(this.originalExerciseList, ['name', 'variant.name']));
          this.resetFilters();
          this.initNewExercise();

          this.toastr.success('Exercise successfully created!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while creating the exercise!');
          console.log(error.error.message);
        });
  }

  deleteExercise(id: string, index: number) {
    this.bLoading = true;
    this.httpService.deleteExercise(id)
      .subscribe(
        (data: any) => {
          this.bLoading = false;

          this.originalExerciseList.splice(index, 1);
          this.exerciseList = _.cloneDeep(_.sortBy(this.originalExerciseList, ['name', 'variant.name']));
          this.filterExercises(null);

          this.toastr.success('Exercise successfully deleted!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while deleting the exercise!');
          console.log(error.error.message);
        });
  }

  initNewExercise() {
    this.newExercise = new Exercise();
    this.newExercise.creator = this.account.user._id;
  }

  /* FILTER FUNCTIONS */
  filterExercises(event: any) {
    let filters = _.cloneDeep(this.filters);
    let user = this.account.user;
    this.exerciseList = _.filter(this.originalExerciseList, function(e) {
      return (
        (filters.name != '' ? e.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
        (filters.variant.name != '' ? e.variant.name.toLowerCase().includes(filters.variant.name.toLowerCase()) : true) &&
        (filters.variant.intensityCoefficient != null ? (e.variant.intensityCoefficient == filters.variant.intensityCoefficient) : true) &&
        (filters.description != '' ? e.description.toLowerCase().includes(filters.description.toLowerCase()) : true) &&
        (filters.type == 'custom' ? (user.coaches.includes(e.creator) || user._id == e.creator) : 
         (filters.type == 'default' ? !(user.coaches.includes(e.creator) || user._id == e.creator) : true) )
      );
    });
  }

  resetFilters() {
    this.filters = { bExpanded: true, type: '', name: '', variant: {name: '', intensityCoefficient: null}, description: ''};
    this.initFiltersExpandability();
  }

  cancelFilters() {
    this.resetFilters();
    this.resetSortStatus();
    this.filterExercises(null);
  }

  areFiltersDirty(): boolean {
    return (this.filters.type != '' || this.filters.name != '' || this.filters.variant.name != '' || this.filters.variant.intensityCoefficient != null || this.filters.description != '');
  }
  
  resetSortStatus() {
    this.sortListStatus = {name: null, variant: null, description: null};
  }

  sortListByField(field: string) {
    let currentFieldStatus = this.sortListStatus[field];
    this.resetSortStatus();
    this.sortListStatus[field] = currentFieldStatus == null ? true : !currentFieldStatus;

    if(field=='variant')
      this.exerciseList = _.orderBy(this.exerciseList, ['variant.name', 'variant.intensityCoefficient'], this.sortListStatus[field] ? 'asc' : 'desc');
    else
      this.exerciseList = _.orderBy(this.exerciseList, field, this.sortListStatus[field] ? 'asc' : 'desc');
  }

  sortListByFieldUI(field: string) {
    if(!this.bLoading) {
      this.sortListByField(field);
    }
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
