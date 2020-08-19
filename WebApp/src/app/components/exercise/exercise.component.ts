import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Exercise } from 'src/app/model';
import { HttpService } from 'src/app/services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit {

  public bLoading: boolean = false;
  public exercise: Exercise = new Exercise();

  constructor(private router: Router, private httpService: HttpService, private toastr: ToastrService) {
    let exerciseId = (this.router.url).split('/')[2];
    this.bLoading = true;
    this.httpService.getExercise(exerciseId)
      .subscribe(
        (data: any) => {
          this.exercise = data;
          this.bLoading = false;
          console.log(this.exercise);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the exercise!');
          console.log(error.error.message);
        });
  }

  ngOnInit(): void {
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
