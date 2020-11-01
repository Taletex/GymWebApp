import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbDate, NgbCalendar, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { UtilsService } from '@app/_services/utils-service/utils-service.service';
import { TrainingService } from '../../services/training-service/training-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Training, Week, Series, Exercise, Session, User, Variant, SessionExercise } from '@app/_models/training-model';
import * as _ from "lodash";
import { GeneralService, PAGES, PAGEMODE, PageStatus } from '@app/_services/general-service/general-service.service';
import * as jsPDF from 'jspdf';
import { Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';

declare const tinymce: any;

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  public training: Training = new Training();
  public readOnlyTraining: Training = new Training();
  public activeWeek: number;
  public copiedWeek: Week = new Week();
  public copiedSession: Session = new Session();
  public activeSession: Array<number>;
  public copiedExercise: SessionExercise = new SessionExercise();
  public copiedSeries: Series = new Series();
  public athleteList: Array<User> = [];
  public exerciseList: Array<Exercise> = [];
  public hoveredDate: NgbDate | null = null;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;

  // Account information
  account = this.accountService.accountValue;
  public Role = Role;

  // Visual notifies 
  public bLoading = false;
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public pageStatus: PageStatus = new PageStatus();

  // Aux attributes for new exercise handling
  public newExercise: Exercise = new Exercise();
  private currentExerciseIndex: number = 0;
  private currentExerciseList: Array<SessionExercise> = [new SessionExercise()];

  // TinyMCE variables
  public editorContent: string = "";
  public bTinyMCEEditorOpen: boolean = false;
  public tinyMCEoptions = {
    height: 1000,
    plugins: [
    'advlist autolink lists link image charmap print preview anchor noneditable',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table paste code help wordcount'
    ], 
    toolbar:
    'closeEditor undo redo | formatselect | bold italic backcolor | \
    alignleft aligncenter alignright alignjustify | \
    bullist numlist outdent indent | removeformat | help',
    content_css: 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
    noneditable_noneditable_class: 'mceNonEditable',
    content_style: '.mceNonEditable{ background-color: #343a40 !important; color: white !important; cursor: not-allowed !important; }'
    /* setup: function (editor) {
      editor.ui.registry.addButton('closeEditor', {
        icon: 'insert-time',
        tooltip: 'Close Current Editor',
        text: 'Close Editor',
        onAction: function () {
          alert('Button clicked!');
        }
      }); 
    } */

  };

  // Options
  public options = {format: {weeksForRow: 1, seriesFormat: "seriesxrep"}};
  

  /* CONSTRUCTOR */
  constructor(private generalService: GeneralService, private accountService: AccountService, private utilsService: UtilsService, private trainingService: TrainingService, public router: Router, private toastr: ToastrService, private calendar: NgbCalendar, public httpService: HttpService) {

    // Init training attributes
    let trainingId = (this.router.url).split('/')[2];
    this.bLoading = true;
    this.httpService.getTraining(trainingId)
      .subscribe(
        (data: any) => {
          this.training = data;
          this.readOnlyTraining = _.cloneDeep(this.training);
          console.log(this.training);

          // Init exercise list
          this.getExercises();

          // Init athlete list
          this.getAthletes();

          this.activeWeek = 1;
          this.activeSession = [];
          for(let i=0;i<this.training.weeks.length;i++) {
            this.activeSession.push(1);
          }

          this.fromDate = calendar.getToday();
          this.toDate = calendar.getNext(calendar.getToday(), 'd', 28);

          this.editorContent = this.trainingService.trainingReadViewToString(this.training, this.options);

          this.pageStatus = this.generalService.getPageStatus();
          console.log(this.pageStatus);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the training!');
          console.log(error.error.message);
        });
  }

  ngOnInit() {}

  // From services
  compareObjects = this.utilsService.compareObjects;

  // Init exercise typeahead
  search = (text$: Observable<string>) => 
    text$.pipe(
      debounceTime(200),
      map(term => term === '' ? this.exerciseList
        : ((this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)).length==0 ?
          [new Exercise("Nuovo Esercizio", new Variant("new", -1))] : (this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)))
        )
    )
  
  formatter = (x: {name: string}) => x.name;
    
  changeMode(mode: PAGEMODE) {
    if(mode == PAGEMODE.READONLY)
      this.readOnlyTraining = _.cloneDeep(this.training);

    this.closeTinyMCEEditor();
    this.pageStatus[PAGES.TRAININGS] = mode;
    this.generalService.setPageStatus(mode, PAGES.TRAININGS);
  }

  getAthletes() {
    this.bLoading = true;

    this.httpService.getAthletes()
    .subscribe(
      (data: Array<User>) => {
        this.athleteList = data;
        console.log(this.athleteList);
        this.bLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while loading the athlete list!');
        console.log(error.error.message);
      });
  }

  getExercises() {
    this.bLoading = true;

    this.httpService.getExercises()
    .subscribe(
      (data: Array<Exercise>) => {
        this.exerciseList = data;
        console.log(this.exerciseList);
        this.bLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while loading the exercise list!');
        console.log(error.error.message);
      });
  }

  createExercise() {
    this.bLoading = true;
    this.httpService.createExercise(this.newExercise)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.assignExercise(data, this.currentExerciseList, this.currentExerciseIndex);
          this.toastr.success('Exercise successfully created!');

          // Re init exercise list
          this.getExercises();
          this.newExercise = new Exercise();
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while creating the exercise!');
          console.log(error.error.message);
        });
  }

  abortCreateExercise() {
    this.assignExercise(new Exercise(), this.currentExerciseList, this.currentExerciseIndex);
  }
  
  /* This function calls a modal if a new exercise need to be created, else calls assignExercise function */
  selectExercise(event, exerciseList: Array<SessionExercise>, exerciseIndex: number) {
    if(event.item.variant.intensityCoefficient == -1) {
      this.currentExerciseList = exerciseList;
      this.currentExerciseIndex = exerciseIndex;
      this.newExercise.name = (document.getElementById("exercise_" + exerciseIndex) as HTMLInputElement).value;
      document.getElementById("exerciseModalButton").click();
    }
    else 
      this.assignExercise(event.item, exerciseList, exerciseIndex);
    
  }

  /** After selecting an exercise this function performs a copy of all fields of selected exercises in the current exercise (except for series) */
  assignExercise(newExercise, exerciseList: Array<SessionExercise>, exerciseIndex: number) {
    let series = _.cloneDeep(exerciseList[exerciseIndex].series);
    exerciseList[exerciseIndex].exercise = _.cloneDeep(newExercise);
    exerciseList[exerciseIndex].series = _.cloneDeep(series);

    console.log(exerciseList[exerciseIndex]);
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

  shiftSeries(exercise: any, index: number, shift: number) {
    if (exercise && exercise.series != null && index < exercise.series.length) {
      if((shift==1 && index==(exercise.series.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting series of index ' + index);
        return;
      }
      
      let currentSeries = _.cloneDeep(exercise.series[index]);
      exercise.series[index] = _.cloneDeep(exercise.series[index+shift]);
      exercise.series[index+shift] = currentSeries;
    }
  }


  /* EXERCISES FUNCTIONS */
  pushExercise(session: Session) {
    if (session && session.exercises != null) {
      session.exercises.push(_.cloneDeep(new SessionExercise()));
    } else {
      console.log('Error: "exercises" is not defined');
    }
  }

  resetExercise(session: Session, index: number) {
    if (session && session.exercises != null && index < session.exercises.length) {
      session.exercises[index] = _.cloneDeep(new SessionExercise());
    } else {
      console.log('ERROR: resetting exercise of index ' + index);
    }
  }

  deleteExercise(session: Session, index: number) {
    if (session && session.exercises != null && index < session.exercises.length) {
      session.exercises.splice(index, 1);
    } else {
      console.log('ERROR: removing exercise of index ' + index);
    }
  }

  copyExercise(session: Session, index: number) {
    if (session && session.exercises != null && index < session.exercises.length) {
      this.copiedExercise = _.cloneDeep(session.exercises[index]);
    } else {
      console.log('ERROR: copying exercise of index ' + index);
    }
  }

  pasteExercise(session: Session, index: number) {
    if (session && session.exercises != null && index < session.exercises.length) {
      session.exercises[index] = _.cloneDeep(this.copiedExercise);
    } else {
      console.log('ERROR: pasting exercise of index ' + index);
    }
  }

  shiftExercise(session: Session, index: number, shift: number) {
    if (session && session.exercises != null && index < session.exercises.length) {
      if((shift==1 && index==(session.exercises.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting exercise of index ' + index);
        return;
      }
      
      let currentExercise = _.cloneDeep(session.exercises[index]);
      session.exercises[index] = _.cloneDeep(session.exercises[index+shift]);
      session.exercises[index+shift] = currentExercise;
    } else {
      console.log('ERROR: shifting exercise of index ' + index);
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

  shiftSession(event: MouseEvent, week: any, index: number, shift: number) {
    if (week && week.sessions != null && index < week.sessions.length) {
      if((shift==1 && index==(week.sessions.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting session of index ' + index);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      
      let currentSession = _.cloneDeep(week.sessions[index]);
      week.sessions[index] = _.cloneDeep(week.sessions[index+shift]);
      week.sessions[index+shift] = currentSession;
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

  shiftWeek(event: MouseEvent,index: number, shift: number) {
    if (this.training.weeks != null && index < this.training.weeks.length) {
      if((shift==1 && index==(this.training.weeks.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting week of index ' + index);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      
      let currentWeek = _.cloneDeep(this.training.weeks[index]);
      this.training.weeks[index] = _.cloneDeep(this.training.weeks[index+shift]);
      this.training.weeks[index+shift] = currentWeek;
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

  canTrainingBeSaved() {
    for(let week of this.training.weeks) 
      for(let session of week.sessions) 
        for(let sessionExercise of session.exercises) 
          if(sessionExercise.exercise.name == undefined || sessionExercise.exercise.name == null || sessionExercise.exercise.name == '') {
            return false;
          }
    
    return true;
  }

  // TinyMCE Handling functions
  openTinyMCEEditor() {
    this.editorContent = this.trainingService.trainingReadViewToString(this.readOnlyTraining, this.options);
    this.bTinyMCEEditorOpen = true;
  }

  closeTinyMCEEditor() {
    this.bTinyMCEEditorOpen = false;
  }

  //TODO: Improve functionality
  createPdfFromEditor() {
    /* let pdf = new jsPDF('p', 'pt', 'letter');
    pdf.fromHTML(
      tinymce.activeEditor.getContent(), // HTML string or DOM elem ref.
      10, // x coord
      10,
    );
    pdf.save(this.training._id + ".pdf");
    console.log(this.editorContent); */
    
    tinymce.activeEditor.execCommand('mcePrint');
  }


  /* CONVERSION FUNCTIONS */
  convertPercentage(newMeasure?) {
    if(newMeasure)
      this.readOnlyTraining = this.trainingService.convertPercentage(this.training, this.account.user.personalRecords, newMeasure);
    else
      this.readOnlyTraining = _.cloneDeep(this.training);
  }

  convertLbsToKg() {
    this.readOnlyTraining = this.trainingService.convertLbsToKg(this.readOnlyTraining);
  }

  convertKgToLbs() {
    this.readOnlyTraining = this.trainingService.convertKgToLbs(this.readOnlyTraining);
  }

  setSessionMeasure(session: Session, measure: string) {
    for(let i=0; i<session.exercises.length; i++) {
      for(let j=0; j<session.exercises[i].series.length; j++) {
        session.exercises[i].series[j].measure = measure;
      }
    }
  }

  setExerciseMeasure(exercise: SessionExercise, measure: string) {
    for(let i=0; i<exercise.series.length; i++) {
      exercise.series[i].measure = measure;
    }
  }

  /* READ OPTIONS FUNCTIONS */
  setDefaultoptions() {
    this.options = {format: {weeksForRow: 1, seriesFormat: "seriesxrep"}};
  }

  clampWeeksForRowValue() {
    if(this.options.format.weeksForRow <= 0) 
      this.options.format.weeksForRow = 1;
    else
      if(this.options.format.weeksForRow > 8)
        this.options.format.weeksForRow = 8;
  }

}
