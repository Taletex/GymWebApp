import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Training } from 'src/app/model';
import * as _ from "lodash";
import { timestamp } from 'rxjs/operators';

@Component({
  selector: 'training-line-chart',
  templateUrl: './training-line-chart.component.html',
  styleUrls: ['./training-line-chart.component.scss']
})
export class TrainingLineChartComponent implements OnInit {
  
  @Input() currentTraining: Training;

  public bDatasetInitialized: boolean;
  public graphType: string = 'week';
  public sessionChartLabels: Label[] = [];
  public sessionChartData: ChartDataSets[] = [{data: [], label:'global'}];
  public weekChartLabels: Label[] = [];
  public weekChartData: ChartDataSets[] = [{data: [], label:'global'}];
  public lineChartColors: Color[] = [{ borderColor: 'black', backgroundColor: 'rgba(255,0,0,0.3)',},];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];
  public lineChartOptions: ChartOptions = {
    maintainAspectRatio: false,
    
  };

  constructor() {
  }

  ngOnInit() {
    this.initDataset();
    this.bDatasetInitialized = true;
  }

  ngOnChanges(changes: SimpleChange) {
    if(changes['currentTraining'].currentValue) {
      this.currentTraining = changes['currentTraining'].currentValue;
    }
  }

  /**
   * Adds an exercise intensity to a given dataset
   * @param exerciseName
   * @param exerciseIntensity 
   * @param dataIndex 
   * @param dataset 
   */
  addIntensityToDataset(exerciseName, exerciseIntensity, dataIndex, dataset) {
    let bFind = false;
    let currentData = [];

    for(let i=0; i<dataset.y.length; i++) {
      if(dataset.y[i].label != null && dataset.y[i].label != "" && dataset.y[i].label == exerciseName) {
        // The exercise yet exists in dataset, so we need to add this intensity to the value yet added
        bFind = true;
        if(dataset.y[i].data[dataIndex] != null)
          dataset.y[i].data[dataIndex] = dataset.y[i].data[dataIndex] + exerciseIntensity;
        else
          dataset.y[i].data[dataIndex] = exerciseIntensity;
      } 
    }

    if(!bFind) {
      // The exercise does not exists in dataset, so we need to add it
      currentData = [];
      currentData[dataIndex] = exerciseIntensity;
      dataset.y.push({data: currentData, label: exerciseName});
    }
  }

  // Init dataset. 
  // TODO: IT WORKS ONLY IF MEASURE = PERCENTAGE (NEED TO IMPLEMENT ANOTHER FORMULA FOR OTHER MEASURES)
  // TODO: THE FORMULA FOR EXERCISE INTENSITY CALCULUS DOES NOT OFFERS YET A POINT OF VIEW BY "VARIANT" (praticamente usciranno dei punti tali che i valori di intensità per le varianti si sommano tra loro considerando il coefficiente di intensità, quindi se ho 3 varianti dello stacco da terra e poi ho lo stacco da terra standard, alla fine questi saranno un unico valore finale e non 4 esercizi diversi)
  initDataset() {
    let exerciseIntensity = 0;
    let sessionIntensity = 0;
    let weekIntensity = 0;
    let sessionsDataset = {x: [], y: [{data: [], label:'global'}]};
    let weeksDataset = {x: [], y: [{data: [], label:'global'}]};
    let sessionGlobalIndex = 0;

    for(let [weekIndex, week] of this.currentTraining.weeks.entries()) {
      // Update x value for week dataset
      weeksDataset.x.push(("WEEK " + (weekIndex+1)));
      weekIntensity = 0;

      for(let [sessionIndex, session] of week.sessions.entries()) {
        sessionGlobalIndex = sessionGlobalIndex + 1;

        // Update x value for session dataset
        sessionsDataset.x.push(("WEEK " + (weekIndex+1) + " - " + "SESSION " + (sessionIndex+1) + " - " + session.name));
        sessionIntensity = 0;
        
        // Calculate exercise intensity (stored in exerciseIntensity)
        for(let exercise of session.exercises) {
          exerciseIntensity = 0;
          for(let series of exercise.series) {
            if(series.measure == "%") {
              // Poichè moltiplico * weight dò per scontato che measure = percentage. Non funziona se la misura è diversa e bisogna usare una formula diversa
              exerciseIntensity = exerciseIntensity + (series.seriesNumber * series.repNumber * series.weight);
            }
          }
          exerciseIntensity = exerciseIntensity * exercise.variant.intensityCoefficient;
          sessionIntensity = sessionIntensity + exerciseIntensity;

          
          this.addIntensityToDataset(exercise.name, exerciseIntensity, sessionGlobalIndex-1, sessionsDataset);  // Add exercise intensity to SESSION dataset
          this.addIntensityToDataset(exercise.name, exerciseIntensity, weekIndex, weeksDataset);                // Add exercise intensity to WEEK dataset
        }
        weekIntensity = weekIntensity + sessionIntensity;

        this.addIntensityToDataset("global", sessionIntensity, sessionGlobalIndex-1, sessionsDataset);  // Add global intensity to SESSION dataset
        this.addIntensityToDataset("global", weekIntensity, weekIndex, weeksDataset);                   // Add global intensity to WEEK dataset
      }
    }

    // update class attributes
    this.sessionChartLabels = sessionsDataset.x;
    this.sessionChartData = sessionsDataset.y;
    this.weekChartLabels = weeksDataset.x;
    this.weekChartData = weeksDataset.y;
  }



}
