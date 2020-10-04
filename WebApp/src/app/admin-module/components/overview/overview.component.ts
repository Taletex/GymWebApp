import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({ templateUrl: 'overview.component.html',  styleUrls: ['overview.component.scss'] })
export class OverviewComponent {

    constructor(private router: Router){};

    navigate(section: string) {
        this.router.navigate([section]);
    }
 }