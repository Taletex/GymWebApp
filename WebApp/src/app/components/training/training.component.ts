import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  public training;

  constructor() { }

  ngOnInit() {
    // TODO: prendere con una rest mirata
    this.training = { id: 1,
      autore: {nome: 'Alessandro', cognome: 'Messina', data_creazione: '28/01/2018'},
      atleta: {nome: 'Alessandro', cognome: 'Messina', eta: '23', bw: '85', massimali: {squat: 220, stacco: 280, panca: 155, military_press: 97, front_squat: 170, clean_jerk: 135}},
      allenamento: {
        anno: 5, macro: 2, settimana: 13, tipo: 'powerlifting', rate: 3,
        scheda: [
          {esercizio: 'stacco', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 82, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 87, misura: '%', recupero: '2m'}]},
          {esercizio: 'panca', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 87, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 92, misura: '%', recupero: '2m'}]},
          {esercizio: 'squat', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 85, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 90, misura: '%', recupero: '2m'}]}
        ]
      }
    };
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
