import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Training, User } from '@app/_models/training-model';
import { UtilsService } from '@app/_services/utils-service/utils-service.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-training-modal',
  templateUrl: './training-modal.component.html',
  styleUrls: ['./training-modal.component.scss']
})
export class TrainingModalComponent implements OnInit {

  private originalAthleteList: Array<User>;
  public closeResult: string;
  @Input() newTraining: Training;
  @Input() athleteList: Array<User>;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal, private utilsService: UtilsService) { 
  }

  ngOnInit(): void {
  }

  // From services
  compareObjects = this.utilsService.compareObjects;

  public openTrainingModal(content) {
    this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" }).result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });

    this.originalAthleteList = _.cloneDeep(this.athleteList);
    this.athleteList = _.remove(this.athleteList, function(a) { return a._id == this.newTraining.author._id });
  }

  public pushAthlete() {
    if(this.athleteList.length > 0) {
      this.newTraining.athletes.push(this.athleteList[0]);
      this.athleteList.splice(0,1);
    }
  }

  public removeAthlete(index: number) {
    if(this.newTraining.athletes.length > 0) {
      this.athleteList.push(this.newTraining.athletes[index]);
      this.newTraining.athletes.splice(index, 1);
    }
  }

  public resetTraining() {
    this.newTraining = new Training(this.newTraining.author, [this.newTraining.author]);
    this.athleteList = _.cloneDeep(this.originalAthleteList);
  }

}
