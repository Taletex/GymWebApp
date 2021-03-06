﻿import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailValidator, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account-service/account-service.service';

import { MESSAGES, MustMatch } from '@app/_helpers';
import { ToastrService } from 'ngx-toastr';
import { userTypeValidator } from '@app/_helpers/user-type.validator';
import { emailValidator } from '@app/_helpers/email.validator';
import { USER_TYPES } from '@app/_models/training-model';

@Component({ 
    selector: 'app-register',
    templateUrl: 'register.component.html', 
    styleUrls: ['register.component.scss'] 
})

export class RegisterComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    ACCOUNT_VALIDATORS = this.accountService.ACCOUNT_VALIDATORS;
    bShowPsw: boolean = false;
    bShowConfirmPsw: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            userType: [USER_TYPES.ATHLETE, Validators.required],
            name: ['', [Validators.required, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_NAME_LENGTH)]],
            surname: ['', [Validators.required, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_SURNAME_LENGTH)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH)]],
            password: ['', [Validators.required, Validators.minLength(this.ACCOUNT_VALIDATORS.MIN_PSW_LENGTH), Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_PSW_LENGTH)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(this.ACCOUNT_VALIDATORS.MIN_PSW_LENGTH), Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_PSW_LENGTH)]],
            acceptTerms: [false, Validators.requiredTrue]
        }, {
            validator: [MustMatch('password', 'confirmPassword'), userTypeValidator('userType'), emailValidator('email')]
        });
    }

    acceptTerms(bAccept: boolean) {
        this.f.acceptTerms.setValue(bAccept);
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            this.toastr.warning(MESSAGES.REGISTER_FAIL);
            return;
        }

        this.loading = true;
        this.accountService.register(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../login'], { relativeTo: this.route }).then(() => {
                        this.toastr.success(MESSAGES.REGISTER_SUCCESS);
                    });
                },
                error: error => {
                    this.toastr.error(String(error) || MESSAGES.REGISTER_FAIL);
                    this.loading = false;
                }
            });
    }
}