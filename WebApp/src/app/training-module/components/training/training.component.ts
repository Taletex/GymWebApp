import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbDate, NgbCalendar, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { UtilsService } from '@app/_services/utils-service/utils-service.service';
import { TrainingService } from '../../services/training-service/training-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Training, Week, Series, Exercise, Session, User, Variant, SessionExercise, Notification, TRAINING_STATES, TRAINING_TYPES } from '@app/_models/training-model';
import * as _ from "lodash";
import { GeneralService, PAGES, PAGEMODE, NOTIFY_MEDIUM_TYPE, PageStatus, NOTIFICATION_TYPE } from '@app/_services/general-service/general-service.service';
import * as jsPDF from 'jspdf';
import * as $ from 'jquery';
import { Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { stringify } from '@angular/compiler/src/util';

declare const tinymce: any;
const NOTIFICATION_WAIT_SECONDS: number = 30;

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  public bUserAuthorized: boolean = true;
  public TRAINING_STATES = TRAINING_STATES;
  public TRAINING_TYPES = TRAINING_TYPES;
  public training: Training = new Training();
  public draftTraining: Training = new Training();
  public originalTraining: Training = new Training();
  public readOnlyTraining: Training = new Training();
  public activeWeek: number;
  public copiedWeek: Week = new Week();
  public copiedSession: Session = new Session();
  public activeSession: Array<number>;
  public copiedExercise: SessionExercise = new SessionExercise();
  public copiedSeries: Series = new Series();
  public athleteList: Array<any> = [];
  public exerciseList: Array<Exercise> = [];
  public hoveredDate: NgbDate | null = null;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public interval: number;
  public timeLeft: number = NOTIFICATION_WAIT_SECONDS;

  // Account information
  account = this.accountService.accountValue;
  public Role = Role;

  // Visual notifies 
  public bLoading = false;
  public PAGEMODE = PAGEMODE;
  public NOTIFY_MEDIUM_TYPE = NOTIFY_MEDIUM_TYPE;
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
    bullist numlist outdent indent | removeformat | code | help',
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
  public options: any;
  
  // Multiselect dropdown
  public dropdownSettings:IDropdownSettings = {};

  // Others
  public importedTraining: any;
  public replaceTrainingMessage: string = "L'allenamento attuale sarà sovrascritto con la versione precedente selezionata. Sei sicuro di voler procedere?"
  public selectedOldTraining: Training;
  public bDraft: boolean = false;
  public bDirty: boolean = false;


  /* CONSTRUCTOR */
  constructor(private generalService: GeneralService, private accountService: AccountService, private utilsService: UtilsService, private trainingService: TrainingService, public router: Router, private toastr: ToastrService, private calendar: NgbCalendar, public httpService: HttpService) {

    // Init attributes
    this.setDefaultoptions();

    // Init training attributes
    let trainingId = (this.router.url).split('/')[2];
    this.bLoading = true;
    this.httpService.getTraining(trainingId)
      .subscribe(
        (data: Training) => {
          this.bLoading = false;

          this.bUserAuthorized = this.trainingService.isUserAuthorOrAthleteOfTraining(this.account.user._id, data) || this.account.role == Role.Admin;
          console.log("User authorized: " + this.bUserAuthorized);
          if(this.bUserAuthorized) {

            // Init trainings structure with backend data
            this.initTrainingsStructures(data);

            // Init exercise list
            this.getExercises();

            // Init athlete list
            this.athleteList = _.cloneDeep(this.account.user.athletes);
            this.athleteList.push(this.account.user);

            this.activeWeek = 1;
            this.activeSession = [];
            for(let i=0;i<this.training.weeks.length;i++) {
              this.activeSession.push(1);
            }

            this.fromDate = calendar.getToday();
            this.toDate = calendar.getNext(calendar.getToday(), 'd', 28);

            this.editorContent = this.generalService.trainingReadViewToString(this.training, this.options);

            this.pageStatus = this.generalService.getPageStatus();
            if(this.pageStatus[PAGES.TRAININGS] == PAGEMODE.READONLY)
              this.initReadOnlyPage();
            console.log(this.pageStatus);

            this.initDraftTraining();

          }
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the training!');
          console.log(error.error.message);
        });

    
  }
  
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    if(!this.canNotificationBeSent()) {
      this.timeLeft = Math.abs( Math.trunc( ((new Date().getTime()) - (parseInt(localStorage.getItem("sentNotificationTime")))) / 1000 - NOTIFICATION_WAIT_SECONDS) );
      this.startTimer(this.timeLeft);
    }
  }

  get getItems() {
    return this.athleteList.reduce((acc, curr) => {
      acc[curr._id] = curr;
      return acc;
    }, {});
  }
  
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  initTrainingsStructures(data: any) {
    this.training = _.cloneDeep(data);
    this.trainingService.trainingDecorator(this.training);
    this.originalTraining = _.cloneDeep(this.training);
    this.readOnlyTraining = _.cloneDeep(this.training);
    console.log(this.training);
  }

  initDraftTraining() {
    let t = localStorage.getItem("training_" + this.training._id);
    if(t != undefined && t != null && t != "") {
      this.bDraft = true;
      this.draftTraining = JSON.parse(t);
      this.draftTraining.oldVersions = _.cloneDeep(this.training.oldVersions);
    } else {
      this.bDraft = false;
      this.draftTraining = null;
    }

    this.bDirty = this.isTrainingDirty(); 

    // If current training has been modify, than each minute a copy is saved in browser cache
    setInterval((scope) => {
      if(scope.isTrainingDirty()) {
        scope.bDraft = true;
        scope.bDirty = true;
        scope.draftTraining = _.cloneDeep(scope.training);
  
        let t = _.cloneDeep(scope.training);
        delete t.oldVersions;
        localStorage.setItem("training_" + t._id, JSON.stringify(t));
      } else {
        scope.bDirty = false;
      }
    }, 5 * 1000, this);          // 5 * 1000 milsec

  }

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
      this.initReadOnlyPage();
    this.closeTinyMCEEditor();
    this.pageStatus[PAGES.TRAININGS] = mode;
    this.generalService.setPageStatus(mode, PAGES.TRAININGS);
  }
  
  initReadOnlyPage() {
    this.readOnlyTraining = _.cloneDeep(this.training);

    setTimeout((scope) => {
      this.setReadOnlySessionContainerHeight();
    }, 1 * 1000, this);         
  }

  setReadOnlySessionContainerHeight() {
    let maxHeight = 0;
    let height = 0;

    for(let i=0; i<this.readOnlyTraining.weeks.length; i++) {
      for(let j=0; j<this.readOnlyTraining.weeks[i].sessions.length; j++) {
        height = $("#sessionContainer_" + i.toString() + "_" + j.toString()).height();
        if(height > maxHeight) {
          maxHeight = height;
        }
      }
    }

    maxHeight = maxHeight + 50;

    for(let i=0; i<this.readOnlyTraining.weeks.length; i++) {
      for(let j=0; j<this.readOnlyTraining.weeks[i].sessions.length; j++) {
        $("#sessionContainer_" + i + "_" + j).height(maxHeight);
      }
    }

    if(maxHeight) 
      this.options.format.maxSessionContainerHeight = maxHeight + "px";
  }

  getExercises() {
    this.bLoading = true;

    this.httpService.getExercisesForUser(this.account.user._id)
    .subscribe(
      (data: Array<Exercise>) => {
        this.exerciseList = _.sortBy(data, ['name', 'variant.name']);;
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
          this.initNewExercise();
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while creating the exercise!');
          console.log(error.error.message);
        });
  }

  initNewExercise() {
    this.newExercise = new Exercise();
    this.newExercise.creator = this.account.user._id;
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
  blinkBtn(btnId: string) {
    $("#"+btnId).removeClass("whiteFlashBlink");
    $("#"+btnId).addClass("whiteFlashBlink");
    setTimeout(()=>{
      $("#"+btnId).removeClass("whiteFlashBlink");
    }, 1000)
  }

  pushSeries(exercise: any) {
    if (exercise && exercise.series != null) {
      exercise.series.push(_.cloneDeep(new Series()));
    } else {
      console.log('ERROR: pushing new series');
    }
  }

  resetSeries(exercise: any, index: number) {
    this.blinkBtn("seriesRow"+index);
    
    if (exercise && exercise.series != null && index < exercise.series.length) {
      this.generalService.copyObjectWithoutId(exercise.series[index], new Series());
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
    this.blinkBtn("seriesRow"+index);

    if (exercise && exercise.series != null && index < exercise.series.length) {
      this.copiedSeries = _.cloneDeep(exercise.series[index]);
    } else {
      console.log('ERROR: copying series of index ' + index);
    }
  }

  pasteSeries(exercise: any, index: number) {
    this.blinkBtn("seriesRow"+index);

    if (exercise && exercise.series != null && index < exercise.series.length) {
      this.generalService.copyObjectWithoutId(exercise.series[index], this.copiedSeries);
    } else {
      console.log('ERROR: pasting series of index ' + index);
    }
  }

  shiftSeries(exercise: any, index: number, shift: number) {
    this.blinkBtn("seriesRow"+index);
    this.blinkBtn("seriesRow"+(index+shift));

    if (exercise && exercise.series != null && index < exercise.series.length) {
      if((shift==1 && index==(exercise.series.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting series of index ' + index);
        return;
      }
      
      let currentSeries = _.cloneDeep(exercise.series[index]);
      this.generalService.copyObjectWithoutId(exercise.series[index], exercise.series[index+shift]);
      this.generalService.copyObjectWithoutId(exercise.series[index+shift], currentSeries);
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
    this.blinkBtn("exerciseContainer"+index);

    if (session && session.exercises != null && index < session.exercises.length) {
      this.generalService.copyObjectWithoutId(session.exercises[index], new SessionExercise());
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
    this.blinkBtn("exerciseContainer"+index);

    if (session && session.exercises != null && index < session.exercises.length) {
      this.copiedExercise = _.cloneDeep(session.exercises[index]);
    } else {
      console.log('ERROR: copying exercise of index ' + index);
    }
  }

  pasteExercise(session: Session, index: number) {
    this.blinkBtn("exerciseContainer"+index);

    if (session && session.exercises != null && index < session.exercises.length) {
      this.generalService.copyObjectWithoutId(session.exercises[index], this.copiedExercise);
    } else {
      console.log('ERROR: pasting exercise of index ' + index);
    }
  }

  shiftExercise(session: Session, index: number, shift: number) {
    this.blinkBtn("exerciseContainer"+index);
    this.blinkBtn("exerciseContainer"+(index+shift));

    if (session && session.exercises != null && index < session.exercises.length) {
      if((shift==1 && index==(session.exercises.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting exercise of index ' + index);
        return;
      }
      
      let currentExercise = _.cloneDeep(session.exercises[index]);
      this.generalService.copyObjectWithoutId(session.exercises[index], session.exercises[index+shift]);
      this.generalService.copyObjectWithoutId(session.exercises[index+shift], currentExercise);
    } else {
      console.log('ERROR: shifting exercise of index ' + index);
    }
  }


  /* SESSIONS FUNCTIONS */
  pushSession(event: MouseEvent, week: Week) {
    if (week && week.sessions != null) {
      week.sessions.push(new Session());
    } else {
      console.log('Error: "sessions" is not defined');
    }
    event.preventDefault();
  }

  resetSession(event: MouseEvent, week: Week, index: number, bPrevent: boolean) {
    this.blinkBtn("sessionNavBtn_"+index);

    if (week && week.sessions != null && index < week.sessions.length) {
      this.generalService.copyObjectWithoutId(week.sessions[index], new Session());
    } else {
      console.log('ERROR: resetting session of index ' + index);
    }
    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  deleteSession(event: MouseEvent, week: Week, index: number, weekIndex: number, bPrevent: boolean) {
    if (week && week.sessions != null && index < week.sessions.length) {
      week.sessions.splice(index, 1);
      this.activeSession[weekIndex] = 1;
    } else {
      console.log('ERROR: removing session of index ' + index);
    }
    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  copySession(event: MouseEvent, week: Week, index: number, bPrevent: boolean) {
    this.blinkBtn("sessionNavBtn_"+index);

    if (week && week.sessions != null && index < week.sessions.length) {
      this.copiedSession = _.cloneDeep(week.sessions[index]);
    } else {
      console.log('ERROR: copying session of index ' + index);
    }
    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  pasteSession(event: MouseEvent, week: Week, index: number, bPrevent: boolean) {
    this.blinkBtn("sessionNavBtn_"+index);

    if (week && week.sessions != null && index < week.sessions.length) {
      this.generalService.copyObjectWithoutId(week.sessions[index], this.copiedSession);
    } else {
      console.log('ERROR: pasting session of index ' + index);
    } 
    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  shiftSession(event: MouseEvent, week: Week, index: number, shift: number, bPrevent: boolean) {
    this.blinkBtn("sessionNavBtn_"+index);
    this.blinkBtn("sessionNavBtn_"+(index+shift));

    if (week && week.sessions != null && index < week.sessions.length) {
      if((shift==1 && index==(week.sessions.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting session of index ' + index);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      
      let currentSession = _.cloneDeep(week.sessions[index]);
      this.generalService.copyObjectWithoutId(week.sessions[index], week.sessions[index+shift]);
      this.generalService.copyObjectWithoutId(week.sessions[index+shift], currentSession);
    }

    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }


  /* WEEKS FUNCTIONS */
  pushWeek(event: MouseEvent) {
    this.training.weeks.push(_.cloneDeep(new Week()));
    event.preventDefault();
  }

  resetWeek(event: MouseEvent, index: number, bPrevent: boolean) {
    this.blinkBtn("weekNavBtn_"+index);

    if (this.training.weeks != null && index < this.training.weeks.length) {
      let newWeek = new Week();
      this.generalService.copyObjectWithoutId(this.training.weeks[index], newWeek);
    } else {
      console.log('ERROR: resetting week of index ' + index);
    }
    
    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  deleteWeek(event: MouseEvent, index: number, bPrevent: boolean) {
    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.training.weeks.splice(index, 1);
      this.activeWeek = 1;
    } else {
      console.log('ERROR: removing week of index ' + index);
    }
    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  copyWeek(event: MouseEvent, index: number, bPrevent: boolean) {
    this.blinkBtn("weekNavBtn_"+index);

    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.copiedWeek = _.cloneDeep(this.training.weeks[index]);
    } else {
      console.log('ERROR: copying week of index ' + index);
    }

    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  pasteWeek(event: MouseEvent, index: number, bPrevent: boolean) {
    this.blinkBtn("weekNavBtn_"+index);

    if (this.training.weeks != null && index < this.training.weeks.length) {
      this.generalService.copyObjectWithoutId(this.training.weeks[index], this.copiedWeek);
    } else {
      console.log('ERROR: pasting week of index ' + index);
    } 
    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  shiftWeek(event: MouseEvent,index: number, shift: number, bPrevent: boolean) {
    this.blinkBtn("weekNavBtn_"+index);
    this.blinkBtn("weekNavBtn_"+(index+shift));

    if (this.training.weeks != null && index < this.training.weeks.length) {
      if((shift==1 && index==(this.training.weeks.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting week of index ' + index);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      
      let currentWeek = _.cloneDeep(this.training.weeks[index]);
      this.generalService.copyObjectWithoutId(this.training.weeks[index], this.training.weeks[index+shift]);
      this.generalService.copyObjectWithoutId(this.training.weeks[index+shift], currentWeek);
    }

    if(bPrevent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }


  /* TRAINING FUNCTIONS */
  saveTraining() {
    this.bLoading = true;

    let data = this.trainingService.prepareTrainingData(this.training, this.originalTraining)
    this.httpService.updateTraining(this.training._id, data)
    .subscribe(
      (data: any) => {
        this.bLoading = false;
        this.initTrainingsStructures(data);
        this.resetDraft();
        this.toastr.success('Training successfully updated!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error('An error occurred while updating the training!');
        console.log(error.error.message);
      });
  }
  
  deleteTraining() {
    if (confirm('Vuoi procedere?')) {
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

  canTrainingBeSaved() {
    if(this.training.athletes == null || this.training.athletes.length == 0)
      return false;

    for(let week of this.training.weeks) 
      for(let session of week.sessions) 
        for(let sessionExercise of session.exercises) 
          if(sessionExercise.exercise.name == undefined || sessionExercise.exercise.name == null || sessionExercise.exercise.name == '') {
            return false;
          }
    
    return true;
  }

  isTrainingDirty() {
    return !(_.isEqual(this.training, this.originalTraining));
  }

  resetDraft() {
    localStorage.setItem("training_" + this.training._id, "");
    this.draftTraining = null;
    this.bDraft = false;
  }

  openReplaceTrainingConfirmationModal(oldTraining: Training) {
    this.selectedOldTraining = oldTraining;
    document.getElementById("confirmationModalButton").click();
  }

  updateTrainingWithOldVersion(oldTraining: Training) {
    oldTraining.oldVersions = _.cloneDeep(this.training.oldVersions);     // updates oldTraining oldVersions with the current training one
    this.originalTraining = _.cloneDeep(this.training);                   // original training is now the current training
    this.training = _.cloneDeep(oldTraining);                             // current training is now the old trianing choosen from the UI
    this.saveTraining();                                                  // save the current training
  }

  // TinyMCE Handling functions
  openTinyMCEEditor() {
    this.editorContent = this.generalService.trainingReadViewToString(this.readOnlyTraining, this.options);
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
    if(newMeasure) {
      this.readOnlyTraining = this.trainingService.convertPercentage(this.training, this.account.user.personalRecords, newMeasure);
      this.toastr.warning("Note: exercises percentage value conversion has been done using the current user 1RM exercise with the best matching (in terms of exercise name and variant)");
    }
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
    this.options = {format: {weeksForRow: 1, seriesFormat: "seriesxrep", maxSessionContainerHeight: "auto"}, currentUser: this.account.user};
  }

  clampWeeksForRowValue() {
    if(this.options.format.weeksForRow <= 0) 
      this.options.format.weeksForRow = 1;
    else
      if(this.options.format.weeksForRow > 8)
        this.options.format.weeksForRow = 8;
  }


  /* IMPORT/EXPORT FUNCTIONS */
  exportTraining() {
    this.trainingService.exportTraining(this.training);
    this.toastr.success("Training successfully exported.");
  }

  importTraining(event: any) {
    event.srcElement.files[0].text().then((data) => {
      data._id = this.training._id;
      this.initTrainingsStructures(JSON.parse(data));
      this.bTinyMCEEditorOpen = false;
      this.changeMode(PAGEMODE.READONLY);

      this.toastr.success("Training successfully imported. Save it to keep the changes.");
    }).error((err) => {
      this.toastr.error("An error occurs during import process");
    })
  }

  /* NOTIFICATION FUNCTIONS */
  sendNotifyVia(type: NOTIFY_MEDIUM_TYPE) {
    if(this.canNotificationBeSent()) {
      localStorage.setItem("sentNotificationTime", stringify(new Date().getTime()));
      this.startTimer(null);

      switch(type) {
        case NOTIFY_MEDIUM_TYPE.MYTRAININGPLATFORM:
          this.sendTrainingNotifications();
          break;
        case NOTIFY_MEDIUM_TYPE.EMAIL:
          this.sendTrainingEmails();
          break;
        case NOTIFY_MEDIUM_TYPE.TELEGRAM:
          console.log("TODO");
          alert("TODO");
          break;
      }

    }
  }

  canNotificationBeSent() {
    let currentTime = new Date().getTime();
    let lastNotificationTime = new Date(parseInt(localStorage.getItem("sentNotificationTime"))).getTime();
    return ( lastNotificationTime == null || isNaN(lastNotificationTime) || (currentTime > (lastNotificationTime + (NOTIFICATION_WAIT_SECONDS * 1000))) );
  }

  startTimer(time: number) {
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = time | NOTIFICATION_WAIT_SECONDS;;
      }
    },1000)
  }

  sendTrainingNotifications() {
    if(this.training.athletes.length > 0) {
      this.bLoading = true;

      let notificationMessage = "Il coach " + this.training.author.name + " " + this.training.author.surname + " ha modificato l'<a href='trainings/" + this.training._id + "'>allenamento</a>.";
      let notification = new Notification("", NOTIFICATION_TYPE.TRAINING_MODIFIED, this.account.user._id, "", notificationMessage, false, new Date());  // Note: id is empty because it is assigned from the back-end, destination id is empty because it is assigned from the back-end

      this.httpService.sendTrainingNotifications(this.training._id, _.map(this.training.athletes, function (a) { return a._id;}), notification)
      .subscribe(
        (data) => {
          this.toastr.success("Notifica inviata correttamente a tutti gli atleti dell'allenamento!");
          console.log("sendNotifications data", data);
          this.bLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error("Si è verificato un errore durante l'invio delle notifiche agli atleti dell'allenamento");
          console.log("sendNotification error", error.error.message);
        });
    }
  }

  sendTrainingEmails() {
    if(this.training.athletes.length > 0) {
      this.bLoading = true;

      this.httpService.sendTrainingEmails(this.training, "<div style='font-family:Arial, Helvetica, sans-serif;'>" + this.generalService.trainingReadViewToString(this.readOnlyTraining, this.options) + "</div>")
      .subscribe(
        (data: any) => {
          let message = "Notifica inviata correttamente agli atleti ";
          if(data.successAthletes != null && data.successAthletes.length > 0) {
            for(let athlete of data.successAthletes) {
              message = message + ` ${athlete.name} ${athlete.surname},`;
            }
          }
          this.toastr.success(message);
          console.log("sendTrainingEmails data", data);
          this.bLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error("Si è verificato un errore durante l'invio delle email agli atleti dell'allenamento. Verifica che gli utenti destinatari abbiano configurato una email.");
          console.log("sendTrainingEmails error", error.error.message);
        });
    }
  }

  toggleWeekNavbar(){
    let navbar = $(".week-navbar");
    let navbarBtn = $("#toggle-week-navbar-btn");
    let navbarBtnIcon = $("#toggle-week-navbar-btn-icon");

    if(navbar.hasClass("closed")) {
      navbar.removeClass("closed").addClass("opened");
      navbar.show("fast");
      navbarBtn.removeClass("open-btn").addClass("close-btn");
      navbarBtnIcon.removeClass("fa-arrow-circle-down").addClass("fa-arrow-circle-up");
    }
    else {
      navbar.removeClass("opened").addClass("closed");
      navbar.hide("fast");
      navbarBtn.removeClass("close-btn").addClass("open-btn");
      navbarBtnIcon.removeClass("fa-arrow-circle-up").addClass("fa-arrow-circle-down");
    }
  }
}
