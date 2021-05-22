import { Component, ComponentFactoryResolver, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services/account-service/account-service.service';


@Component({ 
    templateUrl: 'account.component.html',
    styleUrls: ['./account.component.scss']
 })

export class AccountComponent implements OnInit {
    public bLoading: boolean = false;

    // Account information
    account = this.accountService.accountValue;

    // User Component Aux
    userComponent: any;

    constructor(private vcref: ViewContainerRef, private cfr: ComponentFactoryResolver, private accountService: AccountService, private router: Router) {
        this.accountService.account.subscribe(x => {
            this.account = x;
            this.loadUserComponent();
        });
     }

    ngOnInit() {
    }

    async loadUserComponent(){
        if(!this.userComponent) {
            this.vcref.clear();
            const { UserComponent } = await import('@app/user-module/components/user/user.component');
            this.userComponent = this.vcref.createComponent(this.cfr.resolveComponentFactory(UserComponent));
            this.userComponent.instance.accountId = (this.router.url).split('/')[3];
        }
    }
}