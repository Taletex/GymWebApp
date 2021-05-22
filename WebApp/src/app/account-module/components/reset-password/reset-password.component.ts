import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account-service/account-service.service';

import { MESSAGES, MustMatch } from '@app/_helpers';
import { ToastrService } from 'ngx-toastr';

enum TokenStatus {
    Validating,
    Valid,
    Invalid
}

@Component({ 
    selector: 'app-reset-password',
    templateUrl: 'reset-password.component.html', 
    styleUrls: ['reset-password.component.scss']  
})

export class ResetPasswordComponent implements OnInit {
    TokenStatus = TokenStatus;
    tokenStatus = TokenStatus.Validating;
    token = null;
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
            password: ['', [Validators.required, Validators.minLength(this.ACCOUNT_VALIDATORS.MIN_PSW_LENGTH), Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_PSW_LENGTH)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(this.ACCOUNT_VALIDATORS.MIN_PSW_LENGTH), Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_PSW_LENGTH)]],
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        const token = this.route.snapshot.queryParams['token'];

        // remove token from url to prevent http referer leakage
        this.router.navigate([], { relativeTo: this.route, replaceUrl: true });

        this.accountService.validateResetToken(token)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.token = token;
                    this.tokenStatus = TokenStatus.Valid;
                },
                error: () => {
                    this.tokenStatus = TokenStatus.Invalid;
                }
            });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.resetPassword(this.token, this.f.password.value, this.f.confirmPassword.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../login'], { relativeTo: this.route }).then(() => {
                        this.toastr.success(MESSAGES.PASSWORD_RESET_SUCCESS);
                    });;
                },
                error: error => {
                    this.toastr.error(String(error) || MESSAGES.RESET_PSW_FAIL);
                    this.loading = false;
                }
            });
    }
}