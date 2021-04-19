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

  public exercise: Exercise = new Exercise();
  public account: Account;
  public Role = Role;

  public groupDropdownSettings = {};
  public disciplineDropdownSettings = {};
  public TRAINING_TYPES = TRAINING_TYPES;
  public EXERCISE_GROUPS = EXERCISE_GROUPS;
  public exerciseGroupsList = Object.values(this.EXERCISE_GROUPS);
  public exerciseDisciplinesList = Object.values(this.TRAINING_TYPES);

  
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

  get getGroupItems() {
    return this.exerciseGroupsList.reduce((acc, curr) => {
      acc[curr] = curr;
      return acc;
    }, {});
  }

  get getDisciplineItems() {
    return this.exerciseDisciplinesList.reduce((acc, curr) => {
      acc[curr] = curr;
      return acc;
    }, {});
  }

  changeMode(mode: PAGEMODE) {
    this.pageStatus[PAGES.EXERCISES] = mode;
    this.generalService.setPageStatus(mode, PAGES.EXERCISES);
  }

  saveExercise() {
    this.bLoading = true;
    this.httpService.updateExercise(this.exercise._id, this.exercise)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.exercise = data;
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
