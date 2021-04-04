import { Component, Input, OnInit } from '@angular/core';
import { Training } from '@app/_models/training-model';

@Component({
  selector: 'app-training-view',
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss']
})
export class TrainingViewComponent implements OnInit {

  @Input() training: Training;
  @Input() options: any;

  constructor() { }

  ngOnInit(): void {
  }

}
