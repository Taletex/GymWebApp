import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Exercise, EXERCISE_GROUPS, TRAINING_TYPES } from '@app/_models/training-model';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Account, Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { GeneralService, PAGEMODE, PAGES, PageStatus } from '@app/_services/general-service/general-service.service';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit {

  public bLoading: boolean = false;

  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public pageStatus: PageStatus = new PageStatus();

  public exercise: any = new Exercise();
  public account: Account;
  public Role = Role;

  public groupDropdownSettings = {};
  public disciplineDropdownSettings = {};
  public TRAINING_TYPES = TRAINING_TYPES;
  public EXERCISE_GROUPS = EXERCISE_GROUPS;

  // Input aux attributes
  public exerciseGroupsList = Object.values(this.EXERCISE_GROUPS);
  public exerciseDisciplinesList = Object.values(this.TRAINING_TYPES);
  public bImgInputDisabled: boolean = false;
  public fileList: File[] = [];
  public imgList: any = [];
  public fileInputOptions: any = {bImgInputDisabled: (this.pageStatus[PAGES.EXERCISES] != PAGEMODE.WRITE), bImgInputDirty: false};

  public baseServerUrl = this.httpService.baseServerUrl;

  
  constructor(private generalService: GeneralService, private router: Router, private httpService: HttpService, private toastr: ToastrService, private accountService: AccountService) {
    let exerciseId = (this.router.url).split('/')[2];
    this.accountService.account.subscribe(x => this.account = x);

    this.bLoading = true;
    this.httpService.getExercise(exerciseId)
      .subscribe(
        (data: any) => {
          this.exercise = data;
          this.bLoading = false;
          console.log(this.exercise);

          this.pageStatus = this.generalService.getPageStatus();
          this.initImageInputAuxVariables();
          console.log(this.pageStatus);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the exercise!');
          console.log(error.error.message);
        });
  }

  ngOnInit(): void {
    this.groupDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      selectAllText: 'Seleziona Tutti',
      unSelectAllText: 'Deseleziona Tutti',
      allowSearchFilter: true
    };
    this.disciplineDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      selectAllText: 'Seleziona Tutti',
      unSelectAllText: 'Deseleziona Tutti',
      allowSearchFilter: true
    };
  }
  
  initFileInputOptions() {
    this.fileInputOptions = {bImgInputDisabled: (this.pageStatus[PAGES.EXERCISES] != PAGEMODE.WRITE), bImgInputDirty: false};
  }

  initImginputDisabled() {
    this.fileInputOptions.bImgInputDisabled = (this.pageStatus[PAGES.EXERCISES] != PAGEMODE.WRITE);
  }

  initImageInputAuxVariables() {
    this.fileList = [];
    this.imgList = [];
    if(this.exercise.images.length > 0) {
      for(let img of this.exercise.images) {
        let splittedImg = img.split("/");
        this.fileList.push(new File([""], splittedImg[splittedImg.length-1]));
        this.imgList.push({src: img, title: splittedImg[splittedImg.length-1], bNew: false});
      }
    }

    this.initFileInputOptions();
  }

  /**
   * get for groups input select elements
   */
  get getGroupItems() {
    return this.exerciseGroupsList.reduce((acc, curr) => {
      acc[curr] = curr;
      return acc;
    }, {});
  }

  /**
   * get for discipline input select elements
   */
  get getDisciplineItems() {
    return this.exerciseDisciplinesList.reduce((acc, curr) => {
      acc[curr] = curr;
      return acc;
    }, {});
  }

  changeMode(mode: PAGEMODE) {
    this.pageStatus[PAGES.EXERCISES] = mode;
    this.generalService.setPageStatus(mode, PAGES.EXERCISES);
    this.initImginputDisabled();
  }

  saveExercise() {
    this.bLoading = true;

    if(this.fileInputOptions.bImgInputDirty) {
      this.exercise.images = this.imgList;
      this.exercise.bNewImages = true;
    }
    
    this.httpService.updateExercise(this.exercise._id, this.exercise)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.exercise = data;
        this.initImageInputAuxVariables();
        this.toastr.success('Exercise successfully updated!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while updating the exercise!');
        console.log(error.error.message);
      });
  }

  deleteExercise() {
    this.bLoading = true;
    this.httpService.deleteExercise(this.exercise._id)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.toastr.success('Exercise successfully deleted!');
          this.router.navigate(['exercises']);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while deleting the exercise!');
          console.log(error.error.message);
        });
  }

}
