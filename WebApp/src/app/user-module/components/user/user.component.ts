import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity, Exercise, Federation, PersonalRecord, PRSeries, Residence, User, Variant } from '@app/_models/training-model';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from '@app/_models';
import { GeneralService, NOTIFICATION_TYPE, PAGEMODE, PAGES, PageStatus } from '@app/_services/general-service/general-service.service';
import { UserService } from '@app/user-module/services/user-service/user-service.service';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  public bLoading: boolean = false;

  public user: User = new User();
  public activityList: Activity[] = [];

  // Account information
  public account: Account;
  public Role = Role;

  // Pagemode handling
  public PAGEMODE = PAGEMODE;
  public PAGES = PAGES;
  public pageStatus: PageStatus = new PageStatus();

  // User Form
  userForm: FormGroup;
  userFormSubmitted = false;
  today = new Date();
  personalRecordList: PersonalRecord[] = <PersonalRecord[]>[];    // Aux array to store personal records from form
  exerciseList: Exercise[] = <Exercise[]>[];
  copiedSeries: PRSeries = new PRSeries();
  copiedPR: PersonalRecord = new PersonalRecord();

  // Aux attributes for new exercise handling
  public newExercise: Exercise = new Exercise();
  private currentExerciseIndex: number = 0;

  // User service aux
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;


  constructor(public userService: UserService, private generalService: GeneralService, private accountService: AccountService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private toastr: ToastrService, private httpService: HttpService, private socket: Socket) {
    this.bLoading = true;
    this.accountService.account.subscribe(x => this.account = x);
    
    // Page status init
    this.pageStatus = this.generalService.getPageStatus();
    console.log(this.pageStatus);

    // get user informations
    this.getUser((this.router.url).split('/')[2]);

    // Socket events
    let scope = this;
    socket.on('userListUserUpdated', function(user) {
      // Update user if page status is "READONLY"
      if(user != null && scope.pageStatus[scope.PAGES.USERS] == scope.PAGEMODE.READONLY) {
        scope.user = _.cloneDeep(user);
      }
    })
  }

  ngOnInit() {
  }

  getUser(userId: string) {
    this.httpService.getUser(userId)
      .subscribe(
        (data: any) => {
          this.user = data;
          this.bLoading = false;
          console.log(this.user);

          this.activityList.push(new Activity('lasjd0123uasd', 'competition', 'Torneo Nazionale WPA', ['powerlifting'], new Federation("10892asjnd", "WPA"), 'nazionale', ['all'], ['all'], new Residence('italia', 'alimena', 'via della piovra 5'), new Date("05/22/2021"), new Date("05/23/2021"), "Gara nazionale WPA 2021, utile per le qualificazioni ai mondiali", [this.user._id], ["50 euro"], [], ["prozis"], this.user._id, true));
          this.activityList.push(new Activity('123ouqnsidunq', 'competition', 'Torneo Nazionale FIPL', ['powerlifting'], new Federation("10892asjnd", "FIPL"), 'nazionale', ['all'], ['all'], new Residence('italia', 'san zenone al lambro', 'via delle rose 123'), new Date("10/06/2021"), new Date("10/08/2021"), "Gara nazionale FIPL 2021, utile per le qualificazioni ai mondiali", [this.user._id], ["50 euro"], ["100 euro primo posto", "50 euro secondo posto"], ["prozis"], this.user._id, true));

          this.postUserInitialization();

          this.pageStatus = this.generalService.getPageStatus();
          console.log(this.pageStatus);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the user!');
          console.log(error.error.message);
        });
  }

  postUserInitialization() {
    this.personalRecordList = this.user.personalRecords;

    // Init user form
    this.userForm = this.formBuilder.group({
      name: [this.user.name, Validators.required],
      surname: [this.user.surname, Validators.required],
      dateOfBirth: [moment(this.user.dateOfBirth).format("yyyy-MM-DD")],
      sex: [this.user.sex],
      userType: [this.user.userType, Validators.required],
      bodyWeight: [this.user.bodyWeight],
      yearsOfExperience: [this.user.yearsOfExperience],
      userEmail: [this.user.contacts.email, [Validators.email]],
      telephone: [this.user.contacts.telephone],
      residenceState: [this.user.residence.state],
      residenceCity: [this.user.residence.city],
      residenceAddress: [this.user.residence.address],
      //To implement also personal record using dynamic forms you can follow this link: https://stackoverflow.com/questions/57425789/formgroup-in-formarray-containing-object-displaying-object-object 
    });
    this.personalRecordList = _.cloneDeep(this.user.personalRecords);   // Note: I'm using a simpler solution for handling personal record inputs because using dynamic forms required much time

    // Init exercise list
    this.getExercises();
  }

  changeMode(mode: PAGEMODE) {
    this.pageStatus[PAGES.USERS] = mode;
    this.generalService.setPageStatus(mode, PAGES.USERS);
  }

  // Init exercise typeahead
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        term === ''
          ? this.exerciseList
          : ((this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)).length == 0
            ? ((this.user.userType != 'athlete') ? [new Exercise("Nuovo Esercizio", new Variant("new", -1))] : [])
            : (this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)))
      )
    )

  getExercises() {
    this.bLoading = true;

    this.httpService.getExercisesForUser(this.account.user._id)
      .subscribe(
        (data: Array<Exercise>) => {
          for (let i = 0; i < this.personalRecordList.length; i++) {
            let currentPRid = this.personalRecordList[i].exercise._id;
            _.remove(data, function (exercise) {
              return exercise._id == currentPRid;
            })
          }

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
          this.assignExercise(data, this.currentExerciseIndex);
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
    this.newExercise.creator = this.user._id;
  }

  abortCreateExercise() {
    this.assignExercise(new Exercise(), this.currentExerciseIndex);
  }

  /* SERIES FUNCTIONS */
  pushSeries(pr: PersonalRecord) {
    if (pr && pr.series != null) {
      pr.series.push(_.cloneDeep(new PRSeries()));
    } else {
      console.log('ERROR: pushing new series');
    }
  }

  resetSeries(pr: PersonalRecord, index: number) {
    if (pr && pr.series != null && index < pr.series.length) {
      pr.series[index] = _.cloneDeep(new PRSeries());
    } else {
      console.log('ERROR: resetting series of index ' + index);
    }
  }

  deleteSeries(pr: PersonalRecord, index: number) {
    if (pr && pr.series != null && index < pr.series.length) {
      pr.series.splice(index, 1);
    } else {
      console.log('ERROR: removing series of index ' + index);
    }
  }

  copySeries(pr: PersonalRecord, index: number) {
    if (pr && pr.series != null && index < pr.series.length) {
      this.copiedSeries = _.cloneDeep(pr.series[index]);
    } else {
      console.log('ERROR: copying series of index ' + index);
    }
  }

  pasteSeries(pr: PersonalRecord, index: number) {
    if (pr && pr.series != null && index < pr.series.length) {
      pr.series[index] = _.cloneDeep(this.copiedSeries);
    } else {
      console.log('ERROR: pasting series of index ' + index);
    }
  }


  /* PEROSNAL RECORD FUNCTIONS */
  pushPR() {
    this.personalRecordList.push(_.cloneDeep(new PersonalRecord()));
  }

  resetPR(index: number) {
    if (index < this.personalRecordList.length) {
      this.personalRecordList[index] = _.cloneDeep(new PersonalRecord());
    } else {
      console.log('ERROR: resetting PR of index ' + index);
    }
  }

  deletePR(index: number) {
    if (index < this.personalRecordList.length) {
      this.personalRecordList.splice(index, 1);
    } else {
      console.log('ERROR: removing PR of index ' + index);
    }
  }

  copyPR(index: number) {
    if (index < this.personalRecordList.length) {
      this.copiedPR = _.cloneDeep(this.personalRecordList[index]);
    } else {
      console.log('ERROR: copying PR of index ' + index);
    }
  }

  pastePR(index: number) {
    if (index < this.personalRecordList.length) {
      this.personalRecordList[index] = _.cloneDeep(this.copiedPR);
    } else {
      console.log('ERROR: pasting PR of index ' + index);
    }
  }



  /* This function calls a modal if a new exercise need to be created, else calls assignExercise function */
  selectExercise(event, exerciseIndex: number) {
    if (event.item.variant.intensityCoefficient == -1) {
      this.currentExerciseIndex = exerciseIndex;
      this.newExercise.name = (document.getElementById("pr_" + exerciseIndex) as HTMLInputElement).value;
      document.getElementById("exerciseModalButton").click();
    }
    else
      this.assignExercise(event.item, exerciseIndex);

  }

  /** After selecting an exercise this function performs a copy of all fields of selected exercises in the current exercise (except for series) */
  assignExercise(newExercise, exerciseIndex: number) {
    this.personalRecordList[exerciseIndex].exercise = _.cloneDeep(newExercise);
    console.log(this.personalRecordList[exerciseIndex]);
  }

  setPRlistMeasure(measure: string) {
    for (let i = 0; i < this.personalRecordList.length; i++) {
      for (let j = 0; j < this.personalRecordList[i].series.length; j++) {
        this.personalRecordList[i].series[j].measure = measure;
      }
    }
  }

  setPRMeasure(pr: PersonalRecord, measure: string) {
    for (let i = 0; i < pr.series.length; i++) {
      pr.series[i].measure = measure;
    }
  }


  /* User Form utilities */
  // convenience getter for easy access to userForm fields
  get fu() { return this.userForm.controls; }

  onSubmitUser() {
    this.userFormSubmitted = true;

    // stop here if userForm is invalid
    if (this.userForm.invalid) {
      return;
    }

    // set user value to send to backend
    this.assignFormValuesToUser();

    this.bLoading = true;
    this.httpService.updateUser(this.user._id, this.user)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.user = data;
          this.toastr.success('User information successfully updated!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while updating the user!');
          console.log(error.error.message);
        });
  }

  /* PR Form utilities */
  onSubmitPersonaRecords() {

    if (!this.isPersonalRecordFormValid()) {
      return;
    }

    let newUser = _.cloneDeep(this.user);
    newUser.personalRecords = this.personalRecordList;

    this.bLoading = true;
    this.httpService.updateUser(newUser._id, newUser)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.user = data;
          this.toastr.success('User information successfully updated!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while updating the user!');
          console.log(error.error.message);
        });
  }

  isPersonalRecordFormValid(): boolean {
    for (let i = 0; i < this.personalRecordList.length; i++) {
      if (!this.personalRecordList[i].exercise.name)
        return false;
    }

    return true;
  }

  assignFormValuesToUser() {
    this.user.name = this.userForm.value.name;
    this.user.surname = this.userForm.value.surname;
    this.user.dateOfBirth = this.userForm.value.dateOfBirth;
    this.user.sex = this.userForm.value.sex;
    this.user.bodyWeight = this.userForm.value.bodyWeight;
    this.user.userType = this.userForm.value.userType;
    this.user.yearsOfExperience = this.userForm.value.yearsOfExperience;
    this.user.contacts.email = this.userForm.value.userEmail;
    this.user.contacts.telephone = this.userForm.value.telephone;
    this.user.residence.state = this.userForm.value.residenceState;
    this.user.residence.city = this.userForm.value.residenceCity;
    this.user.residence.address = this.userForm.value.residenceAddress;
  }

  areAllPrsHidden(): boolean {
    for (let i = 0; i < this.personalRecordList.length; i++) {
      if (this.personalRecordList[i].bPublic)
        return false;
    }

    return true;
  }

  filterVisiblePR(): PersonalRecord[] {
    return (this.account.role == Role.Admin ? this.personalRecordList : this.personalRecordList.filter(pr => pr.bPublic));
  }

  filterVisiblePRSeries(pr: PersonalRecord): PRSeries[] {
    return (this.account.role == Role.Admin ? pr.series : pr.series.filter(series => series.bPublic));
  }


  /* Notifications FUNCTIONS */
  sendNotification(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.sendNotification(notificationType, destinationUser, this.account)
    .then((data: any) => {
      this.bLoading = false;
      this.toastr.success('Richiesta correttamente inviata!');
    })
    .catch((error: any) => {
      this.bLoading = false;
      this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
    });
  }
  
  cancelAthleteCoachLink(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.cancelAthleteCoachLink(notificationType, destinationUser, this.account)
    .then((data: any) => {
      this.bLoading = false;
      this.toastr.success('Richiesta correttamente inviata!');
    })
    .catch((error: any) => {
      this.bLoading = false;
      this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
    });
  }

  cancelAthleteCoachLinkRequest(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.cancelAthleteCoachLinkRequest(notificationType, destinationUser)
    .then((data: any) => {
      this.bLoading = false;
      this.toastr.success('Richiesta di collegamento correttamente eliminata!');
    })
    .catch((error: any) => {
      this.bLoading = false;
      this.toastr.error("Si è verificato un errore durante l'eliminazione della richiesta di collegamento!");
    });
  }

}
