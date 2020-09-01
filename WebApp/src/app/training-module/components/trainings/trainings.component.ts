import { Component, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Training, User } from '@app/_models/training-model';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent implements OnInit {
  public trainingList: Array<Training> = [];
  public filters: any = {};
  public bLoading: boolean = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;

  constructor(private httpService: HttpService, private toastr: ToastrService, public generalService: GeneralService) {
    this.filters = { author: { name: '', surname: '' }, creationDate: '', startDate: '', athlete: { name: '', surname: '' }, type: '' };
    this.getTrainings();
  }

  ngOnInit() {
  }

  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id: string) {
    this.generalService.openPageWithMode(mode, page, id);
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
    this.httpService.createTraining(new Training(new User("Andrea", "Adornetto")))
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

  deleteTraining(id: string, index: number) {
    this.bLoading = true;
    this.httpService.deleteTraining(id)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.trainingList.splice(index, 1);
          this.toastr.success('Training successfully deleted!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while deleting the training!');
          console.log(error.error.message);
        });
  }

}