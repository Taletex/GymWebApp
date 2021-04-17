import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import * as _ from "lodash";
import * as moment from "moment";

import { AccountService } from '@app/_services/account-service/account-service.service';

import { MustMatch } from '@app/_helpers';
import { ToastrService } from 'ngx-toastr';
import { Contacts, Residence, User } from '@app/_models/training-model';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Account } from '@app/_models';

@Component({ 
    templateUrl: 'account.component.html',
    styleUrls: ['./account.component.scss']
 })

export class AccountComponent implements OnInit {
    account: Account = new Account();
    form: FormGroup;
    id: string;
    userId: string;
    bLoading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private toastr: ToastrService,
        private httpService: HttpService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            surname: ['', Validators.required],
            dateOfBirth: [''],
            sex: [''],
            userType: ['', Validators.required],
            bodyWeight: [''],
            yearsOfExperience: [''],
            userEmail: ['', Validators.email],
            telephone: [''],
            residenceState: [''],
            residenceCity: [''],
            residenceAddress: [''],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            password: ['', [Validators.minLength(6), Validators.nullValidator]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        this.accountService.getById(this.id)
            .pipe(first())
            .subscribe(x => 
                {
                    this.account = x;

                    this.form.patchValue(
                    {
                        name: x.user.name,
                        surname: x.user.surname,
                        dateOfBirth: moment(x.user.dateOfBirth).format('yyyy-MM-DD'),
                        sex: x.user.sex,
                        userType: x.user.userType,
                        bodyWeight: x.user.bodyWeight,
                        yearsOfExperience: x.user.yearsOfExperience,
                        userEmail: x.user.contacts.email,
                        telephone: x.user.contacts.telephone,
                        residenceState: x.user.residence.state,
                        residenceCity: x.user.residence.city,
                        residenceAddress: x.user.residence.address,
                        email: x.email,
                        role: x.role
                    });
                    this.userId = x.user._id;
                }
            );
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.updateAccount();
    }

    private updateAccount() {
        // set user value to send to backend
        let user = new User(this.form.value.name, this.form.value.surname, this.form.value.dateOfBirth, this.form.value.sex, this.form.value.bodyWeight, this.form.value.userType, this.form.value.yearsOfExperience, new Contacts(this.form.value.userEmail, this.form.value.telephone), new Residence(this.form.value.residenceState, this.form.value.residenceCity, this.form.value.residenceAddress));
        user._id = this.userId;
       
        // set account value to send to backend
        let account = _.omit(this.form.value, ['name', 'surname', 'dateOfBirth', 'sex', 'userType', 'bodyWeight', 'yearsOfExperience', 'userEmail', 'telephone', 'residenceState', 'residenceCity', 'residenceAddress']);

        // Update account then user
        this.bLoading = true;
        this.accountService.update(this.id, account)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.toastr.success('Account information updated successfully');

                    this.httpService.updateUser(this.userId, user)
                    .subscribe(
                        (data: any) => {
                            this.bLoading = false;
                            this.router.navigate(['../'], { relativeTo: this.route }).then(() => {
                                this.toastr.success('User information updated successfully!');
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.bLoading = false;
                            this.toastr.error('An error occurred while updating the user!');
                            console.log(error.error.message);
                        });
                },
                error: error => {
                    this.toastr.error(error);
                    this.bLoading = false;
                }
            });
    }

    deleteAccount() {
        this.bLoading = true;
        this.accountService.delete(this.account.id)
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