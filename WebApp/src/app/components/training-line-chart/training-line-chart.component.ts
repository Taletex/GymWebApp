import { Component, OnInit, Input } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Training } from 'src/app/model';

@Component({
  selector: 'training-line-chart',
  templateUrl: './training-line-chart.component.html',
  styleUrls: ['./training-line-chart.component.scss']
})
export class TrainingLineChartComponent implements OnInit {
  @Input() training: Training;

  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  constructor() {
    this.lineChartData = [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Squat' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Deadlift' },
      { data: [180, 480, 770, 90, 1000, 270, 400], label: 'Bench Press'}
  ];

    // Init dataset. TODO: ORA FUNZIONA SOLO CON MEASURE = PERCENT
    let exerciseIntensity = 0;

    for(let [weekIndex, week] of this.training.weeks.entries()) {
      for(let [sessionIndex, session] of week.sessions.entries()) {

        // Calcolo intensità di un singolo esercizio
        for(let exercise of session.exercises) {
          exerciseIntensity = 0;
          for(let series of exercise.series) {
            // Poichè moltiplico * weight do per scontato che measure = percentage, altrimenti non funziona se la misura è diversa e bisogna usare una formula diversa
            exerciseIntensity = exerciseIntensity + (series.seriesNumber * series.repNumber * series.weight);
          }
          exerciseIntensity = exerciseIntensity * exercise.variant.intensityCoefficient;

          // Aggiungo l'intensità di esercizio alla lista per sessione
          for(let i=0; i<this.lineChartData.length; i++) {
            if(this.lineChartData[i].label == exercise.name) {
              // Esiste già l'esercizio nel dataset, quindi aggiungo la sua intensità al valore già inseritoo
              this.lineChartData[i].data[sessionIndex] = <number>this.lineChartData[i].data[sessionIndex] + exerciseIntensity;
            } else {
              // TODO FIX IL PUSH
              this.lineChartData[i].push({data: [], label: exercise.name});
              this.lineChartData[i].data[sessionIndex] = exerciseIntensity;
            }
          }

          // TODO: Aggiungo l'intensità di esercizio alla lista per week. DEVI FARE UN NUOVO LINE CHART DATA
          for(let i=0; i<this.lineChartData.length; i++) {
            if(this.lineChartData[i].label == exercise.name) {
              // Esiste già l'esercizio nel dataset, quindi aggiungo la sua intensità al valore già inseritoo
              this.lineChartData[i].data[sessionIndex] = <number>this.lineChartData[i].data[sessionIndex] + exerciseIntensity;
            } else {
              // TODO FIX IL PUSH
              this.lineChartData[i].push({data: [], label: exercise.name});
              this.lineChartData[i].data[sessionIndex] = exerciseIntensity;
            }
          }
        }
      }
    }
    this.lineChartData.push({})
   }

  ngOnInit() {
  }

}
