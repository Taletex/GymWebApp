import { Component, OnInit } from '@angular/core';
import * as data from 'src/app/jsons/trainings.json';

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent implements OnInit {
  public trainingList;
  public filters;

  constructor() { 
    this.trainingList = (data as any).default;
    this.filters = { author: { name: '', surname: '' }, creationDate: '', startDate: '', athlete: { name: '', surname: '' }, type: '' };
  }

  ngOnInit() {
  }

}
