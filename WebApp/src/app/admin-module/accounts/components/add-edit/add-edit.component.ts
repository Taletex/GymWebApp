import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import * as _ from "lodash";

import { AccountService } from '@app/_services/account-service/account-service.service';

import { MustMatch } from '@app/_helpers';
import { ToastrService } from 'ngx-toastr';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private toastr: ToastrService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            userType: ['', Validators.required],
            name: ['', Validators.required],
            surname: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            password: ['', [Validators.minLength(6), this.isAddMode ? Validators.required : Validators.nullValidator]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        if (!this.isAddMode) {
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe(x => this.form.patchValue(x));
        }
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
        if (this.isAddMode) {
            this.createAccount();
        } else {
            this.updateAccount();
        }
    }

    private createAccount() {
        this.accountService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../'], { relativeTo: this.route }).then(() => {
                        this.toastr.success('Account created successfully');
                    });
                },
                error: error => {
                    this.toastr.error(error);
                    this.loading = false;
                }
            });
    }

    private updateAccount() {
        let formValue = _.cloneDeep(this.form.value);
        delete formValue.userType;
        delete formValue.name;
        delete formValue.surname;

        this.accountService.update(this.id, formValue)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../../'], { relativeTo: this.route }).then(() => {
                        this.toastr.success('Update successful');
                    });
                },
                error: error => {
                    this.toastr.error(error);
                    this.loading = false;
                }
            });
    }
}