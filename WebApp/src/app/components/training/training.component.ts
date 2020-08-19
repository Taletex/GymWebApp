import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbDate, NgbCalendar, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Training, Week, Series, Exercise, Session, User, Variant } from 'src/app/model';
import * as athleteData from 'src/app/jsons/athletes.json';
import * as _ from "lodash";

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  public training: Training = new Training();
  public activeWeek: number;
  public copiedWeek: Week = new Week();
  public copiedSession: Session = new Session();
  public activeSession: Array<number>;
  public copiedExercise: Exercise = new Exercise();
  public copiedSeries: Series = new Series();
  public athleteList: Array<User> = [new User()];
  public exerciseList: Array<Exercise> = [new Exercise()];
  public hoveredDate: NgbDate | null = null;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;

  public bLoading = false;

  // Init exercise typeahead
  search = (text$: Observable<string>) => 
    text$.pipe(
      debounceTime(200),
      map(term => term === '' ? this.exerciseList
        : ((this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)).length==0 ?
          [new Exercise("Nuovo allenamento", new Variant("new", -1))] : (this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)))
        )
    )


  /* CONSTRUCTOR */
  constructor(public router: Router, private toastr: ToastrService, private calendar: NgbCalendar, public httpService: HttpService) {

    // Init training attribute
    
    let trainingId = (this.router.url).split('/')[2];
    this.bLoading = true;
    this.httpService.getTraining(trainingId)
      .subscribe(
        (data: any) => {
          this.training = data;
          console.log(this.training);

          // Init exercise list
          this.httpService.getExercises()
          .subscribe(
            (data: any) => {
              this.exerciseList = data;
              this.bLoading = false;
            },
            (error: HttpErrorResponse) => {
              this.bLoading = false;
              this.toastr.error('An error occurred while loading the exercise list!');
              console.log(error.error.message);
            });

          // Init athleteList | TODO: prendere la lista quando si creeranno gli atleti
          this.athleteList = ((athleteData as any).default);
          
          this.activeWeek = 1;
          this.activeSession = [];
          for(let i=0;i<this.training.weeks.length;i++) {
            this.activeSession.push(1);
          }

          this.fromDate = calendar.getToday();
          this.toDate = calendar.getNext(calendar.getToday(), 'd', 28);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the training!');
          console.log(error.error.message);
        });
  }

  ngOnInit() {}

  /** After selecting an exercise this function performs a copy of all fields of selected exercises in the current exercise (except for series) */
  selectExercise(event, exerciseList: Array<Exercise>, exerciseIndex: number) {
    if(event.item.variant.intensityCoefficient == -1) {
      // TODO: CREARE NUOVO ESERCIZIO TRAMITE MODALE
      // Assegnare ad event.item il nuovo esercizio cosi dopo fa le azioni giuste
    } 
    let series = _.cloneDeep(exerciseList[exerciseIndex].series);
    exerciseList[exerciseIndex] = _.cloneDeep(event.item);
    exerciseList[exerciseIndex].series = _.cloneDeep(series);
  }

  /* SERIES FUNCTIONS */
  pushSeries(exercise: any) {
    if (exercise && exercise.series != null) {
      exercise.series.push(_.cloneDeep(new Series()));
    } else {
      console.log('ERROR: pushing new series');
    }
  }
  resetSeries(exercise: any, index: number) {
    if (exercise && exercise.series != null && index < exercise.series.length) {
      exercise.series[index] = _.cloneDeep(new Series());
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
      training.exercises.push(_.cloneDeep(new Exercise()));
    } else {
      console.log('Error: "exercises" is not defined');
    }
  }

  resetExercise(training: any, index: number) {
    if (training && training.exercises != null && index < training.exercises.length) {
      training.exercises[index] = _.cloneDeep(new Exercise());
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
      week.sessions.push(new Session());
    } else {
      console.log('Error: "sessions" is not defined');
    }
    event.preventDefault();
  }

  resetSession(event: MouseEvent, week: any, index: number) {
    if (week && week.sessions != null && index < week.sessions.length) {
      week.sessions[index] = new Session();
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
    this.training.weeks.push(_.cloneDeep(new Week()));
    event.preventDefault();
  }

  resetWeek(event: MouseEvent, index: number) {
    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.training.weeks[index] = _.cloneDeep(new Week());
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
    this.httpService.updateTraining(this.training._id, this.training)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.training = data;
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
    this.httpService.deleteTraining(this.training._id)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.toastr.success('Training successfully deleted!');
        this.router.navigate(['trainings']);
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while deleting the training!');
        console.log(error.error.message);
      });
  }
}
