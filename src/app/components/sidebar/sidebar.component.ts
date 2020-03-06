import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() quote;
  @Output() sectionClick: EventEmitter<String> = new EventEmitter<String>();
  public bActive;

  constructor() { }

  ngOnInit() {
    this.bActive = true;
  }

}
