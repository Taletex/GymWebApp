import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MustMatch } from '@app/_helpers';
import { Role } from '@app/_models';
import { Contacts, Exercise, PersonalRecord, PRSeries, Residence, User, Variant } from '@app/_models/training-model';

import { AccountService } from '@app/_services/account-service/account-service.service';
import { GeneralService, PAGEMODE, PAGES, PageStatus } from '@app/_services/general-service/general-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, first, map } from 'rxjs/operators';

import * as moment from "moment";
import * as _ from "lodash";
import { Observable } from 'rxjs';

@Component({ templateUrl: 'profile-details.component.html', styleUrls: ['./profile-details.component.scss'] })
export class ProfileDetailsComponent {
    public bLoading: boolean = false;

    // Account information
    account = this.accountService.accountValue;
    public Role = Role;

    // Pagemode handling
    public PAGEMODE = PAGEMODE;
    public PAGES = PAGES;
    public pageStatus: PageStatus = new PageStatus();

    // Account Form
    accountForm: FormGroup;
    accountFormSubmitted = false;
    accountFormDeleting = false;

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

    constructor(private generalService: GeneralService, private accountService: AccountService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private toastr: ToastrService, private httpService: HttpService) { }

    ngOnInit() {
        this.personalRecordList = this.account.user.personalRecords;

        // Init user form
        this.userForm = this.formBuilder.group({
            name: [this.account.user.name, Validators.required],
            surname: [this.account.user.surname, Validators.required],
            dateOfBirth: [moment(this.account.user.dateOfBirth).format("yyyy-MM-DD")],
            sex: [this.account.user.sex],
            userType: [this.account.user.userType, Validators.required],
            bodyWeight: [this.account.user.bodyWeight],
            yearsOfExperience: [this.account.user.yearsOfExperience],
            userEmail: [this.account.user.contacts.email, [Validators.email]],
            telephone: [this.account.user.contacts.telephone],
            residenceState: [this.account.user.residence.state],
            residenceCity: [this.account.user.residence.city],
            residenceAddress: [this.account.user.residence.address],
            //To implement also personal record using dynamic forms you can follow this link: https://stackoverflow.com/questions/57425789/formgroup-in-formarray-containing-object-displaying-object-object 
        });
        this.personalRecordList = _.cloneDeep(this.account.user.personalRecords);   // Note: I'm using a simpler solution for handling personal record inputs because using dynamic forms required much time

        // Init account form
        this.accountForm = this.formBuilder.group({
            email: [this.account.email, [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        // Page status init
        this.pageStatus = this.generalService.getPageStatus();
        console.log(this.pageStatus);

        // Init exercise list
        this.getExercises();
    }

    changeMode(mode: PAGEMODE) {
        this.pageStatus[PAGES.PROFILES] = mode;
        this.generalService.setPageStatus(mode, PAGES.PROFILES);
    }

    // Init exercise typeahead
    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            map(term => term === '' ? this.exerciseList
                : ((this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)).length == 0 ?
                    [new Exercise("Nuovo Esercizio", new Variant("new", -1))] : (this.exerciseList.filter(v => (v.name + " (" + v.variant.name + ")").toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)))
            )
        )

    getExercises() {
        this.bLoading = true;

        this.httpService.getExercises()
            .subscribe(
                (data: Array<Exercise>) => {
                    for(let i=0; i<this.personalRecordList.length; i++) {
                        let currentPRid = this.personalRecordList[i].exercise._id;
                        _.remove(data, function(exercise) {
                            return exercise._id == currentPRid;
                        })
                    }

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
                    this.assignExercise(data, this.currentExerciseIndex);
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
        this.accountService.update(this.account.id, this.accountForm.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.toastr.success('Update successful');
                },
                error: error => {
                    this.toastr.error(error);
                    this.bLoading = false;
                }
            });
    }

    onDeleteAccount() {
        if (confirm('Are you sure?')) {
            this.accountFormDeleting = true;
            this.accountService.delete(this.account.id)
                .pipe(first())
                .subscribe(() => {
                    this.toastr.success('Account deleted successfully');
                });
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

        this.bLoading = true;
        let newUser = new User(this.userForm.value.name, this.userForm.value.surname, this.userForm.value.dateOfBirth, this.userForm.value.sex, this.userForm.value.bodyWeight, this.userForm.value.userType, this.userForm.value.yearsOfExperience, new Contacts(this.userForm.value.userEmail, this.userForm.value.telephone), new Residence(this.userForm.value.residenceState, this.userForm.value.residenceCity, this.userForm.value.residenceAddress), this.personalRecordList);
        newUser._id = this.account.user._id;
        this.httpService.updateUser(this.account.user._id, newUser)
            .subscribe(
                (data: any) => {
                    this.bLoading = false;
                    this.account.user = data;
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

        if(!this.isPersonalRecordFormValid()) {
            return;
        }

        let newUser = _.cloneDeep(this.account.user);
        newUser.personalRecords = this.personalRecordList;

        this.bLoading = true;
        this.httpService.updateUser(newUser._id, newUser)
            .subscribe(
                (data: any) => {
                    this.bLoading = false;
                    this.account.user = data;
                    this.toastr.success('User information successfully updated!');
                },
                (error: HttpErrorResponse) => {
                    this.bLoading = false;
                    this.toastr.error('An error occurred while updating the user!');
                    console.log(error.error.message);
                });
    }

    isPersonalRecordFormValid(): boolean {
        for(let i=0; i<this.personalRecordList.length; i++) {
            if(!this.personalRecordList[i].exercise.name)
                return false;
        }

        return true;
    }

}