import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity, Contacts, Exercise, Federation, Notification, OPTION_VISIBILITY, PersonalRecord, PRSeries, Residence, Socials, TRAINING_TYPES, User, UserSettings, USER_TYPES, Variant } from '@app/_models/training-model';
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
import { debounceTime, first, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Socket } from 'ngx-socket-io';
import { MustMatch } from '@app/_helpers/must-match.validator';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  public bLoading: boolean = false;

  // User informations
  @Input() userId: string;
  @Input() accountId: string;
  public user: any = new User();
  public userAccount: Account = new Account();
  public notificationList: Notification[] = [];
  public activityList: Activity[] = [];

  // Account informations
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
  public userFormInitialValues: any;
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

  // Settings Form
  public settingsForm: FormGroup;
  public settingsFormInitialValues: any;
  public settingsFormSubmitted = false;
  public optionsVisibilityList = Object.keys(OPTION_VISIBILITY).filter(key => isNaN(+key));

  // Account Form
  public accountForm: FormGroup;
  public accountFormSubmitted = false;
  public accountFormDeleting = false;

  // Aux attributes for new exercise handling
  public newExercise: Exercise = new Exercise();
  private currentExerciseIndex: number = 0;

  // User service aux
  public NOTIFICATION_TYPE = NOTIFICATION_TYPE;
  public OPTION_VISIBILITY = OPTION_VISIBILITY;

  // Others
  public baseServerUrl: string = this.httpService.baseServerUrl
  public USER_TYPES = USER_TYPES;
  public personalRecordInitialValues: any;


  constructor(public userService: UserService, private generalService: GeneralService, private accountService: AccountService, private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute, private toastr: ToastrService, private httpService: HttpService, socket: Socket) {
    this.bLoading = true;
    this.accountService.account.subscribe(x => this.account = x);
    
    // Page status init
    this.pageStatus = this.generalService.getPageStatus();
    console.log(this.pageStatus);

    // Socket events
    let scope = this;
    socket.on('userListUserUpdated', function(user) {
      // Update user if page status is "READONLY"
      if(user != null && scope.pageStatus[scope.PAGES.USERS] == scope.PAGEMODE.READONLY) {
        scope.userAccount.user = _.cloneDeep(user);
      }
    })
  }

  ngOnInit() {
    if(this.account.role == Role.Admin && this.accountId!=null)                                                                // if admin and accountId!=null get the account from be
      this.getAccount(this.accountId);
    else if(this.account.role == Role.Admin && (this.account.user._id != (this.userId || (this.router.url).split('/')[2])) )   // if admin and the selected account/user is not the current account/user, get the selected account
      this.getAccountByUserId(this.userId || (this.router.url).split('/')[2])
    else if(this.account.user._id == (this.userId || (this.router.url).split('/')[2]))                                         // if the selected account/user is the current account/user use the current account
      this.setAccountFromCurrentAccount();
    else                                                                                                                       // else get the selected user
      this.getUser(this.userId || (this.router.url).split('/')[2]);
  }
  
  // From services
  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

  changeMode(mode: PAGEMODE) {
    this.pageStatus[PAGES.USERS] = mode;
    this.generalService.setPageStatus(mode, PAGES.USERS);
  }


  /* === Initialization Functions === */
  initPageInformations(userData: User, accountData: Account) {
    this.initUserInformations(userData, accountData);
    this.initFormInitialValues();
  }

  initUserInformations(userData: User, accountData: Account) {
    if(!accountData && userData)
      this.userAccount.user = _.cloneDeep(userData);
    else if(accountData && !userData)
      this.userAccount = _.cloneDeep(accountData);
    this.userAccount.user['bNewProfilePicture'] = false;
    this.notificationList = this.userAccount.user.notifications.filter((n) => { return (n.type == NOTIFICATION_TYPE.COACH_REQUEST || n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST) && !n.bConsumed });
  }

  postUserInitialization() {
    this.personalRecordList = this.userAccount.user.personalRecords;

    // Init user form
    this.userForm = this.formBuilder.group({
      profilePicture: [this.userAccount.user.profilePicture || ""],
      biography: [this.userAccount.user.biography],
      name: [this.userAccount.user.name, Validators.required],
      surname: [this.userAccount.user.surname, Validators.required],
      dateOfBirth: [moment(this.userAccount.user.dateOfBirth).format("yyyy-MM-DD")],
      pobState: [this.userAccount.user.placeOfBirth.state],
      pobProvince: [this.userAccount.user.placeOfBirth.province],
      pobCap: [this.userAccount.user.placeOfBirth.cap],
      pobCity: [this.userAccount.user.placeOfBirth.city],
      pobAddress: [this.userAccount.user.placeOfBirth.address],
      sex: [this.userAccount.user.sex],
      userType: [this.userAccount.user.userType, Validators.required],
      bodyWeight: [this.userAccount.user.bodyWeight],
      yearsOfExperience: [this.userAccount.user.yearsOfExperience],
      disciplines: [this.userAccount.user.disciplines],
      gyms: [this.userAccount.user.gyms],
      email: [this.userAccount.user.contacts.email, [Validators.email]],
      telephone: [this.userAccount.user.contacts.telephone],
      socialsFacebook: [this.userAccount.user.contacts.socials.facebook],
      socialsTwitter: [this.userAccount.user.contacts.socials.twitter],
      socialsInstagram: [this.userAccount.user.contacts.socials.instagram],
      socialsLinkedin: [this.userAccount.user.contacts.socials.linkedin],
      socialsOther: [this.userAccount.user.contacts.socials.other],
      residenceState: [this.userAccount.user.residence.state],
      residenceProvince: [this.userAccount.user.residence.province],
      residenceCap: [this.userAccount.user.residence.cap],
      residenceCity: [this.userAccount.user.residence.city],
      residenceAddress: [this.userAccount.user.residence.address],
      //To implement also personal record using dynamic forms you can follow this link: https://stackoverflow.com/questions/57425789/formgroup-in-formarray-containing-object-displaying-object-object 
    });

    // Init settings form
    this.settingsForm = this.formBuilder.group({
      showActivities: [this.userAccount.user.settings.showActivities || 0, Validators.required],
      showPrivateInfo: [this.userAccount.user.settings.showPrivateInfo || 0, Validators.required],
      showPublicInfo: [this.userAccount.user.settings.showPublicInfo || 0, Validators.required]
    });
    
      // Init account form
    this.accountForm = this.formBuilder.group({
      email: [this.userAccount.email, [Validators.required, Validators.email]],
      role: [this.userAccount.role, Validators.required],
      password: ['', [Validators.minLength(6), Validators.nullValidator]],
      confirmPassword: ['']
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    this.personalRecordList = _.cloneDeep(this.userAccount.user.personalRecords);   // Note: I'm using a simpler solution for handling personal record inputs because using dynamic forms required much time

    // Init gyms multiselect list
    this.gymsList = this.userAccount.user.gyms;

    // Init exercise list
    this.getExercises();
  }

  initFormInitialValues() {
    this.userFormInitialValues = _.cloneDeep(this.userForm.value);
    this.settingsFormInitialValues = _.cloneDeep(this.settingsForm.value);
    this.personalRecordInitialValues = _.cloneDeep(this.personalRecordList);
  }

  getAccount(accountId: string) {
    this.accountService.getById(accountId)
      .subscribe(
        (data: any) => {
          this.initUserInformations(null, data);
          // For Test Purpose
          this.activityList.push(new Activity('lasjd0123uasd', 'competition', 'Torneo Nazionale WPA', ['powerlifting'], new Federation("10892asjnd", "WPA"), 'nazionale', ['all'], ['all'], new Residence('italia', 'PA', '91000', 'alimena', 'via della piovra 5'), new Date("05/22/2021"), new Date("05/23/2021"), "Gara nazionale WPA 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], [], ["prozis"], this.userAccount.user._id, true));
          this.activityList.push(new Activity('123ouqnsidunq', 'competition', 'Torneo Nazionale FIPL', ['powerlifting'], new Federation("10892asjnd", "FIPL"), 'nazionale', ['all'], ['all'], new Residence('italia', 'MI', '92000','san zenone al lambro', 'via delle rose 123'), new Date("10/06/2021"), new Date("10/08/2021"), "Gara nazionale FIPL 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], ["100 euro primo posto", "50 euro secondo posto"], ["prozis"], this.userAccount.user._id, true));
          // end test
          this.postUserInitialization();
          this.initFormInitialValues();

          this.bLoading = false;
          console.log(this.userAccount);

          this.pageStatus = this.generalService.getPageStatus();
          console.log(this.pageStatus);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the account!');
          console.log(error.error.message);
        });
  }

  getAccountByUserId(userId: string) {
    this.accountService.getAccountByUserId(userId)
      .subscribe(
        (data: any) => {
          this.initUserInformations(null, data);
          // For Test Purpose
          this.activityList.push(new Activity('lasjd0123uasd', 'competition', 'Torneo Nazionale WPA', ['powerlifting'], new Federation("10892asjnd", "WPA"), 'nazionale', ['all'], ['all'], new Residence('italia', 'PA', '91000', 'alimena', 'via della piovra 5'), new Date("05/22/2021"), new Date("05/23/2021"), "Gara nazionale WPA 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], [], ["prozis"], this.userAccount.user._id, true));
          this.activityList.push(new Activity('123ouqnsidunq', 'competition', 'Torneo Nazionale FIPL', ['powerlifting'], new Federation("10892asjnd", "FIPL"), 'nazionale', ['all'], ['all'], new Residence('italia', 'MI', '92000','san zenone al lambro', 'via delle rose 123'), new Date("10/06/2021"), new Date("10/08/2021"), "Gara nazionale FIPL 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], ["100 euro primo posto", "50 euro secondo posto"], ["prozis"], this.userAccount.user._id, true));
          // end test
          this.postUserInitialization();
          this.initFormInitialValues();

          this.bLoading = false;
          console.log(this.userAccount);

          this.pageStatus = this.generalService.getPageStatus();
          console.log(this.pageStatus);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the account!');
          console.log(error.error.message);
        });
  }

  getUser(userId: string) {
    this.httpService.getUser(userId)
      .subscribe(
        (data: any) => {
          this.initUserInformations(data, null);

          // For Test Purpose
          this.activityList.push(new Activity('lasjd0123uasd', 'competition', 'Torneo Nazionale WPA', ['powerlifting'], new Federation("10892asjnd", "WPA"), 'nazionale', ['all'], ['all'], new Residence('italia', 'PA', '91000', 'alimena', 'via della piovra 5'), new Date("05/22/2021"), new Date("05/23/2021"), "Gara nazionale WPA 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], [], ["prozis"], this.userAccount.user._id, true));
          this.activityList.push(new Activity('123ouqnsidunq', 'competition', 'Torneo Nazionale FIPL', ['powerlifting'], new Federation("10892asjnd", "FIPL"), 'nazionale', ['all'], ['all'], new Residence('italia', 'MI', '92000','san zenone al lambro', 'via delle rose 123'), new Date("10/06/2021"), new Date("10/08/2021"), "Gara nazionale FIPL 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], ["100 euro primo posto", "50 euro secondo posto"], ["prozis"], this.userAccount.user._id, true));
          // end test
          
          this.postUserInitialization();
          this.initFormInitialValues();

          this.bLoading = false;
          this.pageStatus = this.generalService.getPageStatus();
          console.log("User Account", this.userAccount);
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while loading the user!');
          console.log(error.error.message);
        });
  }

  setAccountFromCurrentAccount() {
    this.initUserInformations(null, this.account);

    // For Test Purpose
    this.activityList.push(new Activity('lasjd0123uasd', 'competition', 'Torneo Nazionale WPA', ['powerlifting'], new Federation("10892asjnd", "WPA"), 'nazionale', ['all'], ['all'], new Residence('italia', 'PA', '91000', 'alimena', 'via della piovra 5'), new Date("05/22/2021"), new Date("05/23/2021"), "Gara nazionale WPA 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], [], ["prozis"], this.userAccount.user._id, true));
    this.activityList.push(new Activity('123ouqnsidunq', 'competition', 'Torneo Nazionale FIPL', ['powerlifting'], new Federation("10892asjnd", "FIPL"), 'nazionale', ['all'], ['all'], new Residence('italia', 'MI', '92000','san zenone al lambro', 'via delle rose 123'), new Date("10/06/2021"), new Date("10/08/2021"), "Gara nazionale FIPL 2021, utile per le qualificazioni ai mondiali", [this.userAccount.user._id], ["50 euro"], ["100 euro primo posto", "50 euro secondo posto"], ["prozis"], this.userAccount.user._id, true));
    // end test
    
    this.postUserInitialization();
    this.initFormInitialValues();
  }



  /* === User Form utilities === */
  // convenience getter for easy access to userForm fields
  get fu() { return this.userForm.controls; }

  resetUserForm() {
    this.userForm.reset(this.userFormInitialValues);
  }

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
          this.userAccount.user['bNewProfilePicture'] = true;
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
    this.userForm.value.profilePicture = this.userAccount.user.profilePicture;
    this.userAccount.user['bNewProfilePicture'] = false;
    (document.getElementById("profilePictureFileInput") as HTMLInputElement).value = "";
    document.getElementById("imgUploadTitle").innerHTML = "";
  }

  assignFormValuesToUser() {
    let exceptions = ['pobState', 'pobProvince', 'pobCap', 'pobCity', 'pobAddress', 'socialsFacebook', 'socialsTwitter', 'socialsInstagram', 'socialsLinkedin', 'socialsOther', 
                      'residenceState', 'residenceProvince', 'residenceCap', 'residenceCity', 'residenceAddress'];
    for (const [key, value] of Object.entries(this.userForm.value)) {
      if (!exceptions.includes(key)) {
          this.userAccount.user[key] = value;
      }
    }

    // PoB
    this.userAccount.user.placeOfBirth.state = this.userForm.value.pobState;
    this.userAccount.user.placeOfBirth.province = this.userForm.value.pobProvince;
    this.userAccount.user.placeOfBirth.cap = this.userForm.value.pobCap;
    this.userAccount.user.placeOfBirth.city = this.userForm.value.pobCity;
    this.userAccount.user.placeOfBirth.address = this.userForm.value.pobAddress;
    // Contacts
    this.userAccount.user.contacts.socials.facebook = this.userForm.value.socialsFacebook;
    this.userAccount.user.contacts.socials.twitter = this.userForm.value.socialsTwitter;
    this.userAccount.user.contacts.socials.instagram = this.userForm.value.socialsInstagram;
    this.userAccount.user.contacts.socials.linkedin = this.userForm.value.socialsLinkedin;
    this.userAccount.user.contacts.socials.other = this.userForm.value.socialsOther;
    // Residence
    this.userAccount.user.residence.state = this.userForm.value.residenceState;
    this.userAccount.user.residence.province = this.userForm.value.residenceProvince;
    this.userAccount.user.residence.cap = this.userForm.value.residenceCap;
    this.userAccount.user.residence.city = this.userForm.value.residenceCity;
    this.userAccount.user.residence.address = this.userForm.value.residenceAddress;
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
    this.httpService.updateUser(this.userAccount.user._id, this.userAccount.user)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.initPageInformations(data, null);

          this.accountService.updateUserValue(data);

          this.toastr.success('User information successfully updated!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while updating the user!');
          console.log(error.error.message);
        });
  }


  /* === PR Form utilities === */
  resetPRForm() {
    this.personalRecordList = _.cloneDeep(this.personalRecordInitialValues);
  }

  // Init exercise typeahead
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        term === ''
          ? this.exerciseList
          : ((this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)).length == 0
            ? ((this.userAccount.user.userType != 'athlete') ? [new Exercise("Nuovo Esercizio", new Variant("new", -1))] : [])
            : (this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)))
      )
    )

  getExercises() {
    this.bLoading = true;

    this.httpService.getExercisesForUser(this.userAccount.user._id)
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
    this.newExercise.creator = this.userAccount.user._id;
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

    let newUser = _.cloneDeep(this.userAccount.user);
    newUser.personalRecords = this.personalRecordList;

    this.bLoading = true;
    this.httpService.updateUser(newUser._id, newUser)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.initPageInformations(data, null);
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

  /**
   * If the current user is an admin or the user of this userpage and the page mode is WRITE, return the full personalRecordList, else return the personalRecordList filtered by bPublic attribute (set to true)
   */
  filterVisiblePR(): PersonalRecord[] {
    return (((this.account.role == Role.Admin || this.account.user._id == this.userAccount.user._id) && this.pageStatus[PAGES.USERS] == PAGEMODE.WRITE) ? this.personalRecordList : this.personalRecordList.filter(pr => pr.bPublic));
  }

  /**
   * If the current user is an admin or the user of this userpage and the page mode is WRITE, return the full pr.series, else return the pr.series filtered by bPublic attribute (set to true)
   */
  filterVisiblePRSeries(pr: PersonalRecord): PRSeries[] {
    return (((this.account.role == Role.Admin || this.account.user._id == this.userAccount.user._id) && this.pageStatus[PAGES.USERS] == PAGEMODE.WRITE) ? pr.series : pr.series.filter(series => series.bPublic));
  }


  /* === Options Form utilities === */
  // convenience getter for easy access to settingsForm fields
  get fo() { return this.settingsForm.controls; }

  resetSettingsForm() {
    this.settingsForm.reset(this.settingsFormInitialValues);
  }

  assignFormOptionsValueToUser() {

    for (const [key, value] of Object.entries(this.settingsForm.value)) {
        this.userAccount.user.settings[key] = value;
    }
  }

  onSubmitSettings() {
    this.settingsFormSubmitted = true;

    // stop here if settingsForm is invalid
    if (this.settingsForm.invalid) {
      return;
    }

    // set user value to send to backend
    this.assignFormOptionsValueToUser();

    this.bLoading = true;
    this.httpService.updateUser(this.userAccount.user._id, this.userAccount.user)
      .subscribe(
        (data: any) => {
          this.bLoading = false;
          this.initPageInformations(data, null);
          this.toastr.success('User information successfully updated!');
        },
        (error: HttpErrorResponse) => {
          this.bLoading = false;
          this.toastr.error('An error occurred while updating the user!');
          console.log(error.error.message);
        });
  }

  /* Account Form utilities */
  // convenience getter for easy access to accountForm fields
  get fa() { return this.accountForm.controls; }

  onSubmitAccount() {
      this.accountFormSubmitted = true;

      // stop here if accountForm is invalid
      if (this.accountForm.invalid) {
          return;
      }

      this.bLoading = true;
      this.accountService.update(this.userAccount.id, this.accountForm.value)
          .pipe(first())
          .subscribe({
              next: () => {
                  this.bLoading = false;
                  this.toastr.success('Update successful');
              },
              error: error => {
                  this.toastr.error(error);
                  this.bLoading = false;
              }
          });
  }

  deleteAccount() {
      if (confirm('Vuoi procedere?')) {
          this.accountFormDeleting = true;
          this.bLoading = true;
          this.accountService.delete(this.userAccount.id)
              .pipe(first())
              .subscribe(() => {
                this.bLoading = false;
                this.router.navigate(['../'], { relativeTo: this.route }).then(() => {
                    this.toastr.success('Account successfully deleted!');
                });
            },
            (error: HttpErrorResponse) => {
                this.bLoading = false;
                this.toastr.error('An error occurred while deleting the account!');
                console.log(error.error.message);
            });
      }
  }


  /* Notifications FUNCTIONS */
  sendNotification(notificationType: NOTIFICATION_TYPE, destinationUser: User, fromAccount: Account) {
    this.bLoading = true;

    this.userService.sendNotification(notificationType, destinationUser, fromAccount)
    .then(() => {
      this.bLoading = false;
      this.toastr.success('Richiesta correttamente inviata!');
    })
    .catch(() => {
      this.bLoading = false;
      this.toastr.error("Si è verificato un errore durante l'invio della richiesta");
    });
  }
  
  cancelAthleteCoachLink(notificationType: NOTIFICATION_TYPE, destinationUser: User, fromAccount: Account, bLinkAction: boolean) {
    this.bLoading = true;

    this.userService.cancelAthleteCoachLink(notificationType, destinationUser, fromAccount)
    .then(() => {
      // If this is an Admin link cancelAthleteCoachLink request we must update the link list manually since the socket will not receive any information
      if(bLinkAction)
        this.removeLink(notificationType, destinationUser._id); 
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

  removeLink(notificationType: NOTIFICATION_TYPE, userId: string) {
    if(notificationType == NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK)
      this.userAccount.user.coaches.splice(this.userAccount.user.coaches.findIndex((u)=>{return (u['_id'] == userId)}), 1);
    else if(notificationType == NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK) 
      this.userAccount.user.athletes.splice(this.userAccount.user.athletes.findIndex((u)=>{return (u['_id'] == userId)}), 1);
  }

  addLink(notificationType: string, user: any) {
    if(notificationType == NOTIFICATION_TYPE.ATHLETE_REQUEST)
      this.userAccount.user.coaches.push(user);
    else if(notificationType == NOTIFICATION_TYPE.COACH_REQUEST) 
      this.userAccount.user.athletes.push(user);
  }

  acceptRequest(notification: Notification) {
    this.bLoading = true;
    this.httpService.acceptRequest(this.userAccount.user._id, notification)
    .subscribe(
      (data: any) => {
        this.removeNotification(notification._id);            // MUST update notifications list since socket does not update it (or its user)
        this.addLink(notification.type, notification.from);   // MUST update link list since socket does not update it (or its user)
        this.bLoading = false;
        console.log("acceptRequest result data", data);
        this.toastr.success('Richiesta correttamente accettata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di accettazione richiesta");
        console.log("acceptRequest error", error);
      });
  }

  refuseRequest(notification: Notification) {
    this.bLoading = true;
    this.httpService.refuseRequest(this.userAccount.user._id, notification)
    .subscribe(
      (data: any) => {
        this.removeNotification(notification._id);  // MUST update notifications list since socket does not update it (or its user)
        this.bLoading = false;
        console.log("refuseRequest result data", data);
        this.toastr.success('Richiesta correttamente rifiutata!');
      },
      (error: HttpErrorResponse) => {
        this.bLoading = false;
        this.toastr.error("Si è verificato un errore durante l'invio di rifiuto richiesta");
        console.log("refuseRequest error", error);
      });
  }

  removeNotification(notificationId: string) {
    this.notificationList.splice(this.notificationList.findIndex((n)=>{return (n._id == notificationId)}), 1);  
  }
  
}
