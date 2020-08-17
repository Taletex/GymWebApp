import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Exercise } from 'src/model';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss']
})
export class ExercisesComponent implements OnInit {
  public exerciseList: Array<Exercise>;
  public filters: any;
  public bLoading: boolean;

  constructor(private httpService: HttpService, private toastr: ToastrService) { 
    this.filters = { author: { name: '', surname: '' }, creationDate: '', startDate: '', athlete: { name: '', surname: '' }, type: '' };
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
    this.httpService.createExercise(new Exercise())
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
}
