import { Component } from '@angular/core';

import { AccountService } from '@app/_services/account-service/account-service.service';


@Component({ templateUrl: 'details.component.html' })
export class DetailsComponent {
    account = this.accountService.accountValue;

    constructor(private accountService: AccountService) { }
}