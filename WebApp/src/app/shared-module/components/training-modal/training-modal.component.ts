import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Training, User } from '@app/_models/training-model';
import { UtilsService } from '@app/_services/utils-service/utils-service.service';

@Component({
  selector: 'app-training-modal',
  templateUrl: './training-modal.component.html',
  styleUrls: ['./training-modal.component.scss']
})
export class TrainingModalComponent implements OnInit {

  public closeResult: string;
  @Input() newTraining: Training;
  @Input() athleteList: Array<User>;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal, private utilsService: UtilsService) { }

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
  }

}
