import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/services/security-service/security-service.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() quote;
  @Output() sectionClick: EventEmitter<String> = new EventEmitter<String>();
  public bActiveList = {homepage: false, trainings: false, maximum: false, notifications: false, userprofile: false};
  public bExpandedSidebar;
  public currentUsername;
  
  constructor(public router: Router, private securityService: SecurityService) { }

  ngOnInit() {
    this.bExpandedSidebar = true;
    this.bActiveList[(this.router.url).split('/')[1]] = true;
    this.currentUsername = this.securityService.getUsername();
  }

}
