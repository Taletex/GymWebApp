import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';

import { AccountService } from '@app/_services/account-service/account-service.service';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@app/_helpers';

@Component({ 
    selector: 'app-forgot-password',
    templateUrl: 'forgot-password.component.html', 
    styleUrls: ['forgot-password.component.scss']  
})

export class ForgotPasswordComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    ACCOUNT_VALIDATORS = this.accountService.ACCOUNT_VALIDATORS;

    constructor(
        private formBuilder: FormBuilder,
        private accountService: AccountService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH)]]
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
        this.accountService.forgotPassword(this.f.email.value)
            .pipe(first())
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => this.toastr.success(MESSAGES.FORGOT_PASSWORD),
                error: error => this.toastr.error(String(error) || MESSAGES.FORGOT_PASSWORD_FAIL)
            });
    }
}