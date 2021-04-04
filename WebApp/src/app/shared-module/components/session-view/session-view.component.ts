import { Component, Input, OnInit } from '@angular/core';
import { Session } from '@app/_models/training-model';

@Component({
  selector: 'app-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: ['./session-view.component.scss']
})
export class SessionViewComponent implements OnInit {

  @Input() session: Session;
  @Input() options: any;

  constructor() { }

  ngOnInit(): void {
  }

}
