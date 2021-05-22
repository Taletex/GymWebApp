import { Component, HostListener, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account-service/account-service.service';

import { Account, Role } from '@app/_models';
import { ToastrService } from 'ngx-toastr';

import * as _ from 'lodash';
import { HttpErrorResponse } from '@angular/common/http';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';
import { MESSAGES } from '@app/_helpers';

@Component({ templateUrl: 'list.component.html', styleUrls: ['./list.component.scss'] })
export class ListComponent implements OnInit {
    
    public originalAccountList: Array<Account> = [];
    public accountList: Array<Account> = [];
    public filters: any = {};
    public bLoading: boolean = false;
    public createModalResult: any = {};
    public account: Account;
    public Role = Role;
    public sortListStatus: any;
    public bWindowOverMd: boolean;
    private lastWindowWidth: number;
    private triggerWidth: number = 767.98;

    public PAGEMODE = PAGEMODE;
    public PAGES = PAGES;

    constructor(private accountService: AccountService, private toastr: ToastrService, private generalService: GeneralService) {
        this.accountService.account.subscribe(x => this.account = x);

        // Init account list 
        this.getAccounts();

        // Init new account
        this.initNewAccountModalResult();

        // Init filters and sort status
        this.resetFilters();
        this.resetSortStatus();

        // Init responsiveness aux
        this.lastWindowWidth = window.innerWidth;
        this.initFiltersExpandability();
    }

    ngOnInit() {
    }

    
    // From services
    openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
        this.generalService.openPageWithMode(mode, page, id);
    } 


    getAccounts() {
        this.bLoading = true;
        this.accountService.getAll()
            .pipe(first())
            .subscribe(accounts => {
                this.originalAccountList = accounts;
                this.accountList = _.cloneDeep(_.sortBy(this.originalAccountList, ['role', 'user.name', 'user.surname']));
                this.resetFilters();

                this.bLoading = false;
                console.log(this.accountList);
            },
                (error: HttpErrorResponse) => {
                    this.bLoading = false;
                    this.toastr.error(String(error) || MESSAGES.ACCOUNTS_GET_FAIL);
                    console.log(error);
                });
    }

    createAccount() {
        this.bLoading = true;
        this.accountService.create(this.createModalResult.data)
          .subscribe(
            (data: any) => {
              this.bLoading = false;

              this.originalAccountList.push(data);
              this.accountList = _.cloneDeep(_.sortBy(this.originalAccountList, ['name', 'variant.name']));
              this.resetFilters();
              this.initNewAccountModalResult();

              this.toastr.success(MESSAGES.ACCOUNT_CREATE_SUCCESS);
            },
            (error: HttpErrorResponse) => {
              this.bLoading = false;
              this.toastr.error(String(error) || MESSAGES.ACCOUNT_CREATE_FAIL);
              console.log(error);
            });
      }


    deleteAccount(id: string) {
        if (confirm('Vuoi procedere?')) {
            this.bLoading = true;
            this.accountService.delete(id)
                .pipe(first())
                .subscribe(() => {
                    this.bLoading = false;

                    this.originalAccountList.splice(this.originalAccountList.findIndex((a) => { return a.id == id; }), 1);
                    this.accountList = _.cloneDeep(_.sortBy(this.originalAccountList, ['role', 'user.name', 'user.surname']));
                    this.filterAccounts(null);

                    this.toastr.success(MESSAGES.ACCOUNT_DELETE_SUCCESS);
                },
                    (error: HttpErrorResponse) => {
                        this.bLoading = false;
                        this.toastr.error(String(error) || MESSAGES.ACCOUNT_DELETE_FAIL);
                        console.log(error);
                    });
        }
    }

    initNewAccountModalResult() {
        this.createModalResult = {};
    }

    /* FILTER FUNCTIONS */
    filterAccounts(event: any) {
        let filters = _.cloneDeep(this.filters);
        let user = this.account.user;
        this.accountList = _.filter(this.originalAccountList, function (e) {
            return (
                (filters.name != '' ? e.user.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
                (filters.surname != '' ? e.user.surname.toLowerCase().includes(filters.surname.toLowerCase()) : true) &&
                (filters.email != '' ? e.email.toLowerCase().includes(filters.email.toLowerCase()) : true) &&
                (filters.role != '' ? e.role.toLowerCase().includes(filters.role.toLowerCase()) : true)
            );
        });
    }

    resetFilters() {
        this.filters = { bExpanded: true, name: '', surname: '', email: '', role: '' };
        this.initFiltersExpandability();
    }

    cancelFilters() {
        this.resetFilters();
        this.resetSortStatus();
        this.filterAccounts(null);
    }

    areFiltersDirty(): boolean {
        return (this.filters.name != '' || this.filters.surname != '' || this.filters.email != '' || this.filters.role != '');
    }

    resetSortStatus() {
        this.sortListStatus = { name: null, variant: null, description: null };
    }

    sortListByField(field: string) {
        let currentFieldStatus = this.sortListStatus[field];
        this.resetSortStatus();
        this.sortListStatus[field] = currentFieldStatus == null ? true : !currentFieldStatus;

        if (field == 'name')
            this.accountList = _.orderBy(this.accountList, ['user.name', 'user.surname'], this.sortListStatus[field] ? 'asc' : 'desc');
        else
            this.accountList = _.orderBy(this.accountList, field, this.sortListStatus[field] ? 'asc' : 'desc');
    }

    sortListByFieldUI(field: string) {
        if (!this.bLoading) {
            this.sortListByField(field);
        }
    }


    /* responsiveness FUNCTIONS */
    initFiltersExpandability() {
        if (this.lastWindowWidth >= this.triggerWidth)
            this.filters.bExpanded = true;
        else if (this.lastWindowWidth < this.triggerWidth)
            this.filters.bExpanded = false;

        this.bWindowOverMd = this.filters.bExpanded;
    }

    @HostListener('window:resize', ['$event'])
    @HostListener('fullscreenchange', ['$event'])
    @HostListener('webkitfullscreenchange', ['$event'])
    @HostListener('mozfullscreenchange', ['$event'])
    @HostListener('MSFullscreenChange', ['$event'])
    onResize(event) {
        let currentWidth = event.target.innerWidth;

        if (currentWidth < this.triggerWidth && this.lastWindowWidth >= this.triggerWidth)
            this.filters.bExpanded = this.bWindowOverMd = false;
        else if (currentWidth >= this.triggerWidth && this.lastWindowWidth < this.triggerWidth)
            this.filters.bExpanded = this.bWindowOverMd = true;

        this.lastWindowWidth = currentWidth;
    }
}