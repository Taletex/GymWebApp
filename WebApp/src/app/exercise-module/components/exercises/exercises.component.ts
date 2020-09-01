import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Exercise } from '@app/_models/training-model';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss']
})
export class ExercisesComponent implements OnInit {
  public exerciseList: Array<Exercise> = [];
  public filters: any = {};
  public bLoading: boolean = false;
  public newExercise: Exercise = new Exercise();

  constructor(private httpService: HttpService, private toastr: ToastrService) { 
    this.filters = { name: '', variant: {name: '', intensityCoefficient: 1}, description: ''};
    this.getExercises();
  }

  ngOnInit(): void {
  }

  getExercises() {
    this.bLoading = true;
    this.httpService.getExercises()
      .subscribe(
        (data: any) => {
          this.exerciseList = data;
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
          this.exerciseList.push(data);
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
          this.exerciseList.splice(index, 1);
          this.toastr.success('Exercise successfully deleted!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while deleting the exercise!');
          console.log(error.error.message);
        });
  }
}
