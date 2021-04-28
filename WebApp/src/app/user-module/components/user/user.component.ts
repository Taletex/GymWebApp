import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity, Contacts, Exercise, Federation, OPTION_VISIBILITY, PersonalRecord, PRSeries, Residence, Socials, TRAINING_TYPES, User, UserSettings, Variant } from '@app/_models/training-model';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { Account, Role } from '@app/_models';
import { GeneralService, NOTIFICATION_TYPE, PAGEMODE, PAGES, PageStatus, USERPROFILE_SECTIONS } from '@app/_services/general-service/general-service.service';
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

  // Pagesection handling
  public USERPROFILE_SECTIONS = USERPROFILE_SECTIONS;
  public currentProfileSection = USERPROFILE_SECTIONS.USER_INFORMATIONS;

  // User Form
  public userForm: FormGroup;
  public userFormSubmitted = false;
  public today = new Date();
  public personalRecordList: PersonalRecord[] = <PersonalRecord[]>[];    // Aux array to store personal records from form
  public exerciseList: Exercise[] = <Exercise[]>[];
  public copiedSeries: PRSeries = new PRSeries();
  public copiedPR: PersonalRecord = new PersonalRecord();
  public TRAINING_TYPES = TRAINING_TYPES;
  public disciplinesList = Object.values(this.TRAINING_TYPES);
  public gymsList = [];
  public maxImageSize: number = 2;    //MB
  public acceptedFormats: string[] = ["image/png", "image/jpeg"];

  // Options Form
  public settingsForm: FormGroup;
  public settingsFormSubmitted = false;
  public optionsVisibilityList = Object.keys(OPTION_VISIBILITY).filter(key => isNaN(+key));

  // Aux attributes for new exercise handling
  public newExercise: Exercise = new Exercise();
  private currentExerciseIndex: number = 0;

  // User service aux
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;
  public OPTION_VISIBILITY = OPTION_VISIBILITY;

  // Others
  public baseServerUrl: string = this.httpService.baseServerUrl


  constructor(public userService: UserService, private generalService: GeneralService, private accountService: AccountService, private formBuilder: FormBuilder, private router: Router, private toastr: ToastrService, private httpService: HttpService, socket: Socket) {
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

          // For Test Purpose
          this.activityList.push(new Activity('lasjd0123uasd', 'competition', 'Torneo Nazionale WPA', ['powerlifting'], new Federation("10892asjnd", "WPA"), 'nazionale', ['all'], ['all'], new Residence('italia', 'PA', '91000', 'alimena', 'via della piovra 5'), new Date("05/22/2021"), new Date("05/23/2021"), "Gara nazionale WPA 2021, utile per le qualificazioni ai mondiali", [this.user._id], ["50 euro"], [], ["prozis"], this.user._id, true));
          this.activityList.push(new Activity('123ouqnsidunq', 'competition', 'Torneo Nazionale FIPL', ['powerlifting'], new Federation("10892asjnd", "FIPL"), 'nazionale', ['all'], ['all'], new Residence('italia', 'MI', '92000','san zenone al lambro', 'via delle rose 123'), new Date("10/06/2021"), new Date("10/08/2021"), "Gara nazionale FIPL 2021, utile per le qualificazioni ai mondiali", [this.user._id], ["50 euro"], ["100 euro primo posto", "50 euro secondo posto"], ["prozis"], this.user._id, true));
          this.user.biography = "questa è la mia biografia fottesega tutti quanti ciaoooo";
          this.user.residence = new Residence("Italia", "Catania", "95018", "Riposto", "Via Etna 83");
          this.user.placeOfBirth = new Residence("Italia", "Catania", "95018", "Riposto", "Via Etna 83");
          this.user.profilePicture = "/files/images/users/60508d3d2f05793f18fef46d/linkeding_photo.jpg"
          this.user.gyms = ["Kobra Kai Fitness", "Sport Meeting Giarree asdasd "];
          this.user.contacts = new Contacts("martinafortuna2002@gmail.com", "3496799999", new Socials("https://angular.io/guide/router#router-links", "CIAO2", "CIAO3", "CIAO4", "CIAO5"));
          this.user.settings = new UserSettings();
          // end test
          
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
      profilePicture: [],
      biography: [this.user.biography],
      name: [this.user.name, Validators.required],
      surname: [this.user.surname, Validators.required],
      dateOfBirth: [moment(this.user.dateOfBirth).format("yyyy-MM-DD")],
      pobState: [this.user.placeOfBirth.state],
      pobProvince: [this.user.placeOfBirth.province],
      pobCap: [this.user.placeOfBirth.cap],
      pobCity: [this.user.placeOfBirth.city],
      pobAddress: [this.user.placeOfBirth.address],
      sex: [this.user.sex],
      userType: [this.user.userType, Validators.required],
      bodyWeight: [this.user.bodyWeight],
      yearsOfExperience: [this.user.yearsOfExperience],
      disciplines: [this.user.disciplines],
      gyms: [this.user.gyms],
      email: [this.user.contacts.email, [Validators.email]],
      telephone: [this.user.contacts.telephone],
      socialsFacebook: [this.user.contacts.socials.facebook],
      socialsTwitter: [this.user.contacts.socials.twitter],
      socialsInstagram: [this.user.contacts.socials.instagram],
      socialsLinkedin: [this.user.contacts.socials.linkedin],
      socialsOther: [this.user.contacts.socials.other],
      residenceState: [this.user.residence.state],
      residenceProvince: [this.user.residence.province],
      residenceCap: [this.user.residence.cap],
      residenceCity: [this.user.residence.city],
      residenceAddress: [this.user.residence.address],
      //To implement also personal record using dynamic forms you can follow this link: https://stackoverflow.com/questions/57425789/formgroup-in-formarray-containing-object-displaying-object-object 
    });

    this.settingsForm = this.formBuilder.group({
      showActivities: [this.user.settings.showActivities, Validators.required],
      showPrivateInfo: [this.user.settings.showActivities, Validators.required],
      showPublicInfo: [this.user.settings.showActivities, Validators.required]
    });

    this.personalRecordList = _.cloneDeep(this.user.personalRecords);   // Note: I'm using a simpler solution for handling personal record inputs because using dynamic forms required much time

    // Init gyms multiselect list
    this.gymsList = this.user.gyms;

    // Init exercise list
    this.getExercises();
  }

  changeMode(mode: PAGEMODE) {
    this.pageStatus[PAGES.USERS] = mode;
    this.generalService.setPageStatus(mode, PAGES.USERS);
  }


  /* === User Form utilities === */
  // convenience getter for easy access to userForm fields
  get fu() { return this.userForm.controls; }

  // Multiselect aux
  pushGym() {
    let input = (document.querySelector("#gymsAuxInput") as HTMLInputElement);
    if(input.value != '') {
      // let gymMultiSelect = ((document.querySelector("#userGyms") as unknown) as MultiSelectComponent);

      // Update multiselect values
      this.gymsList = this.gymsList.concat([input.value])

      // Update current input value
      this.userForm.value.gyms = this.userForm.value.gyms.concat([input.value]);
      
      setTimeout(() => {
        // Update multiselect view
        let checkboxes = document.querySelectorAll("[aria-label='"+input.value+"']");
        for(let i=0; i<checkboxes.length; i++) {
          (checkboxes[i] as HTMLInputElement).click();
        }
        input.value = "";
      }, 500);

    }
  }

  // Profile picture management functions
  onFileChange(event) {
    
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;

      if(!this.acceptedFormats.includes(file.type)) {
        this.resetInputFile();
        this.toastr.warning("Le immmagini devono avere estensione .jpeg, .jpg o .png");
        return;
      } else if(Number((((file).size/1024)/1024).toFixed(4)) >= this.maxImageSize) {      // MB
        this.resetInputFile();
        this.toastr.warning("La dimensione massima delle immagini deve essere inferiore a " + this.maxImageSize + "MB");
        return;
      } else {
        
        let reader = new FileReader();
        reader.onload = (e) => {
          this.userForm.patchValue({
            profilePicture: e.target.result
          });
          this.userForm.controls.profilePicture.markAsDirty();
          document.getElementById("imgUploadTitle").innerHTML = file.name;
          console.log("Uploaded file", file);
        }
        
        reader.readAsDataURL(file);       // convert to base64 string
      };
    }
  }

  resetInputFile() {
    this.fu.profilePicture.reset();
    (document.getElementById("profilePictureFileInput") as HTMLInputElement).value = "";
    document.getElementById("imgUploadTitle").innerHTML = "";
  }

  assignFormValuesToUser() {
    let exceptions = ['pobState', 'pobProvince', 'pobCap', 'pobCity', 'pobAddress', 'socialsFacebook', 'socialsTwitter', 'socialsInstagram', 'socialsLinkedin', 'socialsOther', 
                      'residenceState', 'residenceProvince', 'residenceCap', 'residenceCity', 'residenceAddress'];
    for (const [key, value] of Object.entries(this.settingsForm.value)) {
      if (!exceptions.includes(key) && this.user[key] != undefined) {
          this.user[key] = value;
      }
    }
    this.user.placeOfBirth.state = this.userForm.value.pobState;
    this.user.placeOfBirth.province = this.userForm.value.pobProvince;
    this.user.placeOfBirth.cap = this.userForm.value.pobCap;
    this.user.placeOfBirth.city = this.userForm.value.pobCity;
    this.user.placeOfBirth.address = this.userForm.value.pobAddress;
    this.user.contacts.socials.facebook = this.userForm.value.socialsFacebook;
    this.user.contacts.socials.twitter = this.userForm.value.socialsTwitter;
    this.user.contacts.socials.instagram = this.userForm.value.socialsInstagram;
    this.user.contacts.socials.linkedin = this.userForm.value.socialsLinkedin;
    this.user.contacts.socials.other = this.userForm.value.socialsOther;
    this.user.residence.state = this.userForm.value.residenceState;
    this.user.residence.province = this.userForm.value.residenceProvince;
    this.user.residence.cap = this.userForm.value.residenceCap;
    this.user.residence.city = this.userForm.value.residenceCity;
    this.user.residence.address = this.userForm.value.residenceAddress;
  }

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


  /* === PR Form utilities === */
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

  /* Series Functions */
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

  /* Personal Record Functions */
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


  /* === Options Form utilities === */
  // convenience getter for easy access to settingsForm fields
  get fo() { return this.settingsForm.controls; }

  assignFormOptionsValueToUser() {

    for (const [key, value] of Object.entries(this.settingsForm.value)) {
      if (this.user[key] != undefined) {
          this.user[key] = value;
      }
    }
  }

  onSubmitOptions() {
    this.settingsFormSubmitted = true;

    // stop here if settingsForm is invalid
    if (this.settingsForm.invalid) {
      return;
    }

    // set user value to send to backend
    this.assignFormOptionsValueToUser();

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


  /* Notifications FUNCTIONS */
  sendNotification(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.sendNotification(notificationType, destinationUser, this.account)
    .then(() => {
      this.bLoading = false;
      this.toastr.success('Richiesta correttamente inviata!');
    })
    .catch(() => {
      this.bLoading = false;
      this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
    });
  }
  
  cancelAthleteCoachLink(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.cancelAthleteCoachLink(notificationType, destinationUser, this.account)
    .then(() => {
      this.bLoading = false;
      this.toastr.success('Richiesta correttamente inviata!');
    })
    .catch(() => {
      this.bLoading = false;
      this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
    });
  }

  cancelAthleteCoachLinkRequest(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    this.bLoading = true;

    this.userService.cancelAthleteCoachLinkRequest(notificationType, destinationUser)
    .then(() => {
      this.bLoading = false;
      this.toastr.success('Richiesta di collegamento correttamente eliminata!');
    })
    .catch(() => {
      this.bLoading = false;
      this.toastr.error("Si è verificato un errore durante l'eliminazione della richiesta di collegamento!");
    });
  }
  
}
