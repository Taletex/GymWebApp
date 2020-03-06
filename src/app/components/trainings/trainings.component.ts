import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent implements OnInit {
  public trainingList: Array<Object>;
  public filters: Object;

  constructor() { }

  ngOnInit() {
    // TODO: Importante --> definire bene il json ad esempio per quanto riguarda le percentuali dei pesi più che una quantità fissa (parametrizzare tutto!!!)
    this.trainingList = [
      { id: 1,
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
      },
      { id: 2,
        autore: {nome: 'Alessandro', cognome: 'Messina', data_creazione: '28/01/2018'},
        atleta: {nome: 'Alberto', cognome: 'Messina', eta: '22', bw: '80', massimali: {squat: 180, stacco: 225, panca: 140, military_press: 90, front_squat: 140, clean_jerk: 100}},
        allenamento: {
          anno: 5, macro: 2, settimana: 13, tipo: 'powerlifting', rate: 3,
          scheda: [
            {esercizio: 'stacco', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 82, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 87, misura: '%', recupero: '2m'}]},
            {esercizio: 'panca', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 87, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 92, misura: '%', recupero: '2m'}]},
            {esercizio: 'squat', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 85, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 90, misura: '%', recupero: '2m'}]}
          ]
        }
      },
      { id: 3,
        autore: {nome: 'Alessandro', cognome: 'Messina', data_creazione: '28/01/2018'},
        atleta: {nome: 'Alberto', cognome: 'Messina', eta: '22', bw: '80', massimali: {squat: 180, stacco: 225, panca: 140, military_press: 90, front_squat: 140, clean_jerk: 100}},
        allenamento: {
          anno: 5, macro: 2, settimana: 13, tipo: 'powerlifting', rate: 3,
          scheda: [
            {esercizio: 'stacco', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 82, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 87, misura: '%', recupero: '2m'}]},
            {esercizio: 'panca', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 87, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 92, misura: '%', recupero: '2m'}]},
            {esercizio: 'squat', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 85, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 90, misura: '%', recupero: '2m'}]}
          ]
        }
      },
      { id: 4,
        autore: {nome: 'Alessandro', cognome: 'Messina', data_creazione: '28/01/2018'},
        atleta: {nome: 'Alberto', cognome: 'Messina', eta: '22', bw: '80', massimali: {squat: 180, stacco: 225, panca: 140, military_press: 90, front_squat: 140, clean_jerk: 100}},
        allenamento: {
          anno: 5, macro: 2, settimana: 13, tipo: 'powerlifting', rate: 3,
          scheda: [
            {esercizio: 'stacco', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 82, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 87, misura: '%', recupero: '2m'}]},
            {esercizio: 'panca', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 87, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 92, misura: '%', recupero: '2m'}]},
            {esercizio: 'squat', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 85, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 90, misura: '%', recupero: '2m'}]}
          ]
        }
      },
      { id: 5,
        autore: {nome: 'Alessandro', cognome: 'Messina', data_creazione: '28/01/2018'},
        atleta: {nome: 'Alberto', cognome: 'Messina', eta: '22', bw: '80', massimali: {squat: 180, stacco: 225, panca: 140, military_press: 90, front_squat: 140, clean_jerk: 100}},
        allenamento: {
          anno: 5, macro: 2, settimana: 13, tipo: 'powerlifting', rate: 3,
          scheda: [
            {esercizio: 'stacco', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 82, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 87, misura: '%', recupero: '2m'}]},
            {esercizio: 'panca', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 87, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 92, misura: '%', recupero: '2m'}]},
            {esercizio: 'squat', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 85, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 90, misura: '%', recupero: '2m'}]}
          ]
        }
      },
      { id: 6,
        autore: {nome: 'Alessandro', cognome: 'Messina', data_creazione: '28/01/2018'},
        atleta: {nome: 'Alberto', cognome: 'Messina', eta: '22', bw: '80', massimali: {squat: 180, stacco: 225, panca: 140, military_press: 90, front_squat: 140, clean_jerk: 100}},
        allenamento: {
          anno: 5, macro: 2, settimana: 13, tipo: 'powerlifting', rate: 3,
          scheda: [
            {esercizio: 'stacco', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 82, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 87, misura: '%', recupero: '2m'}]},
            {esercizio: 'panca', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 87, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 92, misura: '%', recupero: '2m'}]},
            {esercizio: 'squat', tipo: '5x3+2x2', quantita: [{serie: 5, rep: 3, peso: 85, misura: '%', recupero: '2m'}, {serie: 2, rep: 2, peso: 90, misura: '%', recupero: '2m'}]}
          ]
        }
      }
    ];

    this.filters = {author: {name: '', surname: ''}, creationDate: '', atlete: {name: '', surname: ''}, year: '', macro: '', week: '', type: ''};
  }

}
