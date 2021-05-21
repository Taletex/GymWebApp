import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account-service/account-service.service';
import { ToastrService } from 'ngx-toastr';
import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'] 
})
export class LoginComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    ACCOUNT_VALIDATORS = this.accountService.ACCOUNT_VALIDATORS;
    bShowPsw: boolean = false;

    // Declare this key and iv values in declaration
    private key = '!$_mtp-20052021_$!';
    private iv = 'mtp_!$11092011$!_mtp';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        let bRememberMe = (localStorage.getItem("mtp_rememberMe") == "true")
        let username;
        let psw;

        if(localStorage.getItem("mtp_rememberMe") == "true") {
            username = localStorage.getItem("mtp_username");
            psw = this.decryptUsingAES256(localStorage.getItem("mtp_psw"));
        }

        this.form = this.formBuilder.group({
            email: [username || '', [Validators.required, Validators.email, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH)]],
            password: [psw || '', [Validators.required, Validators.minLength(this.ACCOUNT_VALIDATORS.MIN_PSW_LENGTH), Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_PSW_LENGTH)]],
            rememberMe: bRememberMe
        });
    }

    // Encrypt / Decrypt functions
    encryptUsingAES256(encString: string): string {
        return CryptoJS.AES.encrypt(encString, this.key).toString();
    }
    
    decryptUsingAES256(decString: string): string {
        let decrypted = CryptoJS.AES.decrypt(decString, this.key);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }


    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        if(this.f.rememberMe.value) {
            localStorage.setItem("mtp_rememberMe", "true");
            localStorage.setItem("mtp_username", this.f.email.value);
            localStorage.setItem("mtp_psw", this.encryptUsingAES256(this.f.password.value));
        } else {
            localStorage.setItem("mtp_rememberMe", "false");
            localStorage.setItem("mtp_username", "");
            localStorage.setItem("mtp_psw", "");
        }

        this.loading = true;
        this.accountService.login(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    // Set login info in local storage
                    localStorage.setItem("mtp_bLoggedIn", "true");

                    // get return url from query parameters or default to home page
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: error => {
                    this.toastr.error(error);
                    this.loading = false;
                }
            });
    }
}