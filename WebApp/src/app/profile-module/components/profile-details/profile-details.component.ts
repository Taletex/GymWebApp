import { Component, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { AccountService } from '@app/_services/account-service/account-service.service';


@Component({ templateUrl: 'profile-details.component.html', styleUrls: ['./profile-details.component.scss'] })
export class ProfileDetailsComponent {
    public bLoading: boolean = false;

    // Account information
    account = this.accountService.accountValue;

    // User Component Aux
    userComponent: any;


    constructor(private vcref: ViewContainerRef, private cfr: ComponentFactoryResolver, private accountService: AccountService) {
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
            this.userComponent.instance.userId = this.account.user._id;
        }
    }
}