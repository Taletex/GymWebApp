import { Component, Input, OnInit } from '@angular/core';
import { Exercise } from '@app/_models/training-model';
import { HttpService } from '@app/_services/http-service/http-service.service';

@Component({
  selector: 'app-exercise-view',
  templateUrl: './exercise-view.component.html',
  styleUrls: ['./exercise-view.component.scss']
})
export class ExerciseViewComponent implements OnInit {

  @Input() exercise: Exercise;
  public baseServerUrl = this.httpService.baseServerUrl;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
  }

}
