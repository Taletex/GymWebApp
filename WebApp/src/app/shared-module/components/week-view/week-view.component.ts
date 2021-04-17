import { Component, Input, OnInit } from '@angular/core';
import { Week } from '@app/_models/training-model';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss']
})
export class WeekViewComponent implements OnInit {

  @Input() week: Week;
  @Input() weekIndex: number;
  @Input() options: any;

  constructor() { }

  ngOnInit(): void {
  }

}
