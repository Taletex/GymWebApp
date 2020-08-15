import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http-service/http-service.service';
import * as trainingData from 'src/app/jsons/trainings.json';
import * as athleteData from 'src/app/jsons/athletes.json';
import * as _ from "lodash";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  public training: any;
  public defaultWeek: any;
  public activeWeek: number;
  public copiedWeek: any;
  public defaultSession: any;
  public copiedSession: any;
  public activeSession: Array<number>;
  public defaultExercise: any;
  public copiedExercise: any;
  public defaultSeries: any;
  public copiedSeries: any;
  public athleteList: any;

  public hoveredDate: NgbDate | null = null;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;

  public bLoading = false;

  constructor(public router: Router, private toastr: ToastrService, private calendar: NgbCalendar, public formatter: NgbDateParserFormatter, public httpService: HttpService) {

    // Init training attribute
    let trainingList = ((trainingData as any).default);
    let trainingId = (this.router.url).split('/')[2];
    for(let i=0; i<trainingList.length; i++) {
      if (trainingList[i].id == trainingId) {
        this.training = trainingList[i];
        console.log(this.training);
        break;
      }
    }

    // Init athleteList attribute
    this.athleteList = ((athleteData as any).default);

    // Init "default" and "copied" attributes (TODO: get last id for week and session)
    this.defaultSeries = {seriesNumber: 1, repNumber: 1, weight: 50, measure: "%", rest: "90"};
    this.copiedSeries = _.cloneDeep(this.defaultSeries);
    this.defaultExercise = {id: "12345678", name: "deadlift", variant: {name: "standard", intensityCoefficient: 1}, series: [_.cloneDeep(this.defaultSeries)]};
    this.copiedExercise = _.cloneDeep(this.defaultExercise);
    this.defaultSession = {id: 10000001, name: "", comment: "", exercises: [_.cloneDeep(this.defaultExercise)]};
    this.copiedSession = _.cloneDeep(this.defaultSession);
    this.defaultWeek  = {id: 10000001, comment: "", sessions: [_.cloneDeep(this.defaultSession)]};
    this.copiedWeek  = _.cloneDeep(this.defaultWeek);
    
    this.activeWeek = 1;
    this.activeSession = [];
    for(let i=0;i<this.training.weeks.length;i++) {
      this.activeSession.push(1);
    }

    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 28);
  }

  ngOnInit() {}


  /* SERIES FUNCTIONS */
  pushSeries(exercise: any) {
    if (exercise && exercise.series != null) {
      exercise.series.push(_.cloneDeep(this.defaultSeries));
    } else {
      console.log('ERROR: pushing new series');
    }
  }
  resetSeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index < exercise.series.length) {
      exercise.series[index] = _.cloneDeep(this.defaultSeries);
    } else {
      console.log('ERROR: resetting series of index ' + index);
    }
  }

  deleteSeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index < exercise.series.length) {
      exercise.series.splice(index, 1);
    } else {
      console.log('ERROR: removing series of index ' + index);
    }
  }

  copySeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index < exercise.series.length) {
      this.copiedSeries = _.cloneDeep(exercise.series[index]);
    } else {
      console.log('ERROR: copying series of index ' + index);
    }
  }

  pasteSeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index < exercise.series.length) {
      exercise.series[index] = _.cloneDeep(this.copiedSeries);
    } else {
      console.log('ERROR: pasting series of index ' + index);
    }
  }


  /* EXERCISES FUNCTIONS */
  pushExercise(training: any) {
    if (training && training.exercises != null) {
      training.exercises.push(_.cloneDeep(this.defaultExercise));
    } else {
      console.log('Error: "exercises" is not defined');
    }
  }

  resetExercise(training: any, index: number) {
    if (training && training.exercises != null && index < training.exercises.length) {
      training.exercises[index] = _.cloneDeep(this.defaultExercise);
    } else {
      console.log('ERROR: resetting exercise of index ' + index);
    }
  }

  deleteExercise(training: any, index: number) {
    if (training && training.exercises != null && index < training.exercises.length) {
      training.exercises.splice(index, 1);
    } else {
      console.log('ERROR: removing exercise of index ' + index);
    }
  }

  copyExercise(training: any, index: number) {
    if (training && training.exercises != null && index < training.exercises.length) {
      this.copiedExercise = _.cloneDeep(training.exercises[index]);
    } else {
      console.log('ERROR: copying exercise of index ' + index);
    }
  }

  pasteExercise(training: any, index: number) {
    if (training && training.exercises != null && index < training.exercises.length) {
      training.exercises[index] = _.cloneDeep(this.copiedExercise);
    } else {
      console.log('ERROR: pasting exercise of index ' + index);
    }
  }


  /* SESSIONS FUNCTIONS */
  pushSession(event: MouseEvent, week: any) {
    if (week && week.sessions != null) {
      week.sessions.push(_.cloneDeep(this.defaultSession));
    } else {
      console.log('Error: "sessions" is not defined');
    }
    event.preventDefault();
  }

  resetSession(event: MouseEvent, week: any, index: number) {
    if (week && week.sessions != null && index < week.sessions.length) {
      week.sessions[index] = _.cloneDeep(this.defaultSession);
    } else {
      console.log('ERROR: resetting session of index ' + index);
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  deleteSession(event: MouseEvent, week: any, index: number, weekIndex: number) {
    if (week && week.sessions != null && index < week.sessions.length) {
      week.sessions.splice(index, 1);
      this.activeSession[weekIndex] = 1;
    } else {
      console.log('ERROR: removing session of index ' + index);
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  copySession(event: MouseEvent, week: any, index: number) {
    if (week && week.sessions != null && index < week.sessions.length) {
      this.copiedSession = _.cloneDeep(week.sessions[index]);
    } else {
      console.log('ERROR: copying session of index ' + index);
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  pasteSession(event: MouseEvent, week: any, index: number) {
    if (week && week.sessions != null && index < week.sessions.length) {
      week.sessions[index] = _.cloneDeep(this.copiedSession);
    } else {
      console.log('ERROR: pasting session of index ' + index);
    } 
    event.preventDefault();
    event.stopImmediatePropagation();
  }


  /* WEEKS FUNCTIONS */
  pushWeek(event: MouseEvent) {
    this.training.weeks.push(_.cloneDeep(this.defaultWeek));
    event.preventDefault();
  }

  resetWeek(event: MouseEvent, index: number) {
    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.training.weeks[index] = _.cloneDeep(this.defaultWeek);
    } else {
      console.log('ERROR: resetting week of index ' + index);
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  deleteWeek(event: MouseEvent, index: number) {
    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.training.weeks.splice(index, 1);
      this.activeWeek = 1;
    } else {
      console.log('ERROR: removing week of index ' + index);
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  copyWeek(event: MouseEvent, index: number) {
    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.copiedWeek = _.cloneDeep(this.training.weeks[index]);
    } else {
      console.log('ERROR: copying week of index ' + index);
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  pasteWeek(event: MouseEvent, index: number) {
    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.training.weeks[index] = _.cloneDeep(this.copiedWeek);
    } else {
      console.log('ERROR: pasting week of index ' + index);
    } 
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  /* TRAINING FUNCTIONS */
  saveTraining() {
    this.bLoading = true;
    this.httpService.updateTraining(this.training.id, this.training)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.training = data.training;
        this.toastr.success('Training successfully updated!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while updating the training!');
        console.log(error.error.message);
      });
  }
  
  deleteTraining() {
    this.bLoading = true;
    this.httpService.deleteTraining(this.training.id)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.toastr.success('Training successfully deleted!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while deleting the training!');
        console.log(error.error.message);
      });
  }
}
