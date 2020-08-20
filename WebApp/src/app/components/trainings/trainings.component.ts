import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Training } from 'src/app/model';

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent implements OnInit {
  public trainingList: Array<Training> = [];
  public filters: any = {};
  public bLoading: boolean = false;

  constructor(private httpService: HttpService, private toastr: ToastrService) {
    this.filters = { author: { name: '', surname: '' }, creationDate: '', startDate: '', athlete: { name: '', surname: '' }, type: '' };
    this.getTrainings();
  }

  ngOnInit() {
  }


  getTrainings() {
    this.bLoading = true;
    this.httpService.getTrainings()
      .subscribe(
        (data: any) => {
          this.trainingList = data;
          this.bLoading = false;
          console.log(this.trainingList);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the training list!');
          console.log(error.error.message);
        });
  }


  createTraining() {
    this.bLoading = true;
    this.httpService.createTraining(new Training())
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.trainingList.push(data);
          this.toastr.success('Training successfully created!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while creating the training!');
          console.log(error.error.message);
        });
  }
}