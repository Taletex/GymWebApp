import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import * as data from 'src/app/jsons/trainings.json';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  public training;

  constructor(public router: Router) { 
    let trainingList = ((data as any).default);
    let trainingId = (this.router.url).split('/')[2];

    for(let i=0; i<trainingList.length; i++){
      if (trainingList[i].id == trainingId) {
        this.training = trainingList[i];
        console.log(this.training);
        break;
      }
    }

  }

  ngOnInit() {
    
  }

  pushSeries(exercize: any) {
    if (exercize && exercize.quantita != null) {
      exercize.quantita.push({serie: '', rep: '', peso: '', misura: '%', recupero: '1m30s'});
    } else {
      console.log('Error: "quantita" is not defined');
    }
  }

  pushExercize(training: any) {
    if (training && training.scheda != null) {
      training.scheda.push({esercizio: '', tipo: '', quantita: [{serie: '', rep: '', peso: '', misura: '%', recupero: '1m30s'} ]});
    } else {
      console.log('Error: "scheda" is not defined');
    }
  }
}
