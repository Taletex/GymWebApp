import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@app/_services/account-service/account-service.service';

@Component({
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
    public navbarActiveList = {home: true, services: false, contacts: false, login: false, register: false}; 

    constructor(private router: Router, private accountService: AccountService) {
        // redirect to home if already logged in
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }
    }

    setActiveElem(elem: string) {
        for(let key in this.navbarActiveList) {
            this.navbarActiveList[key] = false;
        }
        this.navbarActiveList[elem] = true;
    }
}