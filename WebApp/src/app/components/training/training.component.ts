import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import * as data from 'src/app/jsons/trainings.json';
import * as _ from "lodash";

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  public training;
  public defaultExercise;
  public copiedExercise;
  public defaultSeries;
  public copiedSeries;

  constructor(public router: Router) {
    this.defaultExercise = {id: "12345678", name: "deadlift", variant: {name: "standard", intensityCoefficient: 1}, series: [{seriesNumber: 1, repNumber: 1, weight: 50, measure: "%", rest: "90"}]};
    this.copiedExercise = {id: "12345678", name: "deadlift", variant: {name: "standard", intensityCoefficient: 1}, series: [{seriesNumber: 1, repNumber: 1, weight: 50, measure: "%", rest: "90"}]};
    this.defaultSeries = {seriesNumber: 1, repNumber: 1, weight: 50, measure: "%", rest: "90"};
    this.copiedSeries = {seriesNumber: 1, repNumber: 1, weight: 50, measure: "%", rest: "90"};

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

  pushSeries(exercise: any) {
    if (exercise && exercise.series != null) {
      exercise.series.push(_.cloneDeep(this.defaultSeries));
    } else {
      console.log('ERROR: pushing new series');
    }
  }

  resetSeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index <exercise.series.length) {
      exercise.series[index] = _.cloneDeep(this.defaultSeries);
    } else {
      console.log('ERROR: resetting series of index ' + index);
    }
  }

  deleteSeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index <exercise.series.length) {
      exercise.series.splice(index, 1);
    } else {
      console.log('ERROR: removing series of index ' + index);
    }
  }

  copySeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index <exercise.series.length) {
      this.copiedSeries = _.cloneDeep(exercise.series[index]);
    } else {
      console.log('ERROR: copying series of index ' + index);
    }
  }

  pasteSeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index <exercise.series.length) {
      exercise.series[index] = _.cloneDeep(this.copiedSeries);
    } else {
      console.log('ERROR: pasting series of index ' + index);
    }
  }

  pushExercise(training: any) {
    if (training && training.exercises != null) {
      training.exercises.push(this.defaultExercise);
    } else {
      console.log('Error: "exercises" is not defined');
    }
  }

  resetExercise(training: any, index: number) {
    if (training && training.exercises != null && index <training.exercises.length) {
      training.exercises[index] = _.cloneDeep(this.defaultExercise);
    } else {
      console.log('ERROR: resetting exercise of index ' + index);
    }
  }

  deleteExercise(training: any, index: number) {
    if (training && training.exercises != null && index <training.exercises.length) {
      training.exercises.splice(index, 1);
    } else {
      console.log('ERROR: removing exercise of index ' + index);
    }
  }

  copyExercise(training: any, index: number) {
    if (training && training.exercises != null && index <training.exercises.length) {
      this.copiedExercise = _.cloneDeep(training.exercises[index]);
    } else {
      console.log('ERROR: copying exercise of index ' + index);
    }
  }

  pasteExercise(training: any, index: number) {
    if (training && training.exercises != null && index <training.exercises.length) {
      training.exercises[index] = _.cloneDeep(this.copiedExercise);
    } else {
      console.log('ERROR: pasting exercise of index ' + index);
    }
  }
}
