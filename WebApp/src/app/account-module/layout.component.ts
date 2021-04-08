import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountService } from '@app/_services/account-service/account-service.service';

@Component({
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
    public navbarActiveList = {home: true, services: false, contacts: false, login: false, register: false}; 

    constructor(public router: Router, private accountService: AccountService, private route: ActivatedRoute) {
        // redirect to home if already logged in
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }

        this.route.fragment.subscribe(fragment => {      
            if (fragment && document.querySelector('#' + fragment) != null) 
                document.querySelector('#' + fragment).scrollIntoView();
        });
        
        let currentSection = (this.router.url.split("/")[2]).split("#")[0];
        this.setActiveElem(currentSection);
    }

    setActiveElem(elem: string) {
        if(this.navbarActiveList[elem] != null) {
            for(let key in this.navbarActiveList) {
                this.navbarActiveList[key] = false;
            }
            this.navbarActiveList[elem] = true;
        }
    }
}