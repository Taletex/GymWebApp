import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MustMatch } from '@app/_helpers';
import { Role } from '@app/_models';
import { Contacts, Residence, User } from '@app/_models/training-model';

import { AccountService } from '@app/_services/account-service/account-service.service';
import { GeneralService, PAGEMODE, PAGES, PageStatus } from '@app/_services/general-service/general-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

import * as moment from "moment";

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

    constructor(private generalService: GeneralService, private accountService: AccountService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private toastr: ToastrService, private httpService: HttpService) { }
    
    ngOnInit() {
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
        });

        this.accountForm = this.formBuilder.group({
            email: [this.account.email, [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
    }

    changeMode(mode: PAGEMODE) {
        this.pageStatus[PAGES.PROFILES] = mode;
        this.generalService.setPageStatus(mode, PAGES.PROFILES);
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
        let newUser = new User(this.userForm.value.name, this.userForm.value.surname, this.userForm.value.dateOfBirth, this.userForm.value.sex, this.userForm.value.bodyWeight, this.userForm.value.userType, this.userForm.value.yearsOfExperience, new Contacts(this.userForm.value.userEmail, this.userForm.value.telephone), new Residence(this.userForm.value.residenceState, this.userForm.value.residenceCity, this.userForm.value.residenceAddress));
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
}