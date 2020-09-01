import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public bActiveList = {homepage: false, trainings: false, exercises: false, users: false, notifications: false, userprofile: false};
  public bExpandedSidebar;
  public currentUsername;
  
  constructor(public router: Router) {
    this.bExpandedSidebar = true;
    this.bActiveList[(this.router.url).split('/')[1]] = true;
   }

  ngOnInit() {
  }

}
