﻿import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account-service/account-service.service';

import { MustMatch } from '@app/_helpers';
import { ToastrService } from 'ngx-toastr';

@Component({ templateUrl: 'register.component.html', styleUrls: ['register.component.scss']  })
export class RegisterComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            userType: ['', Validators.required],
            name: ['', Validators.required],
            surname: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            acceptTerms: [false, Validators.requiredTrue]
        }, {
            validator: MustMatch('password', 'confirmPassword')
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
        this.accountService.register(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../login'], { relativeTo: this.route }).then(() => {
                        this.toastr.success('Registration successful, please check your email for verification instructions');
                    });
                },
                error: error => {
                    this.toastr.error(error);
                    this.loading = false;
                }
            });
    }
}