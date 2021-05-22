import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account-service/account-service.service';

import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@app/_helpers';

enum EmailStatus {
    Verifying,
    Failed
}

@Component({ 
    selector: 'app-verify-email',
    templateUrl: 'verify-email.component.html', 
    styleUrls: ['verify-email.component.scss'] 
})

export class VerifyEmailComponent implements OnInit {
    EmailStatus = EmailStatus;
    emailStatus = EmailStatus.Verifying;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        const token = this.route.snapshot.queryParams['token'];

        // remove token from url to prevent http referer leakage
        this.router.navigate([], { relativeTo: this.route, replaceUrl: true });

        this.accountService.verifyEmail(token)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../login'], { relativeTo: this.route }).then(() => {
                        this.toastr.success(MESSAGES.VERIFICATION_SUCCESS);
                    });
                },
                error: () => {
                    this.emailStatus = EmailStatus.Failed;
                }
            });
    }
}