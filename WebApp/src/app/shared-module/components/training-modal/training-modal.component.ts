import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Training, TRAINING_TYPES, User } from '@app/_models/training-model';
import { UtilsService } from '@app/_services/utils-service/utils-service.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TrainingService } from '@app/training-module/services/training-service/training-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-training-modal',
  templateUrl: './training-modal.component.html',
  styleUrls: ['./training-modal.component.scss']
})
export class TrainingModalComponent implements OnInit {

  private dropdownSettings = {};
  public closeResult: string;
  public TRAINING_TYPES = TRAINING_TYPES;
  public TRAINING_VALIDATIONS: any;
  public modal: any;

  @Input() newTraining: Training;
  @Input() athleteList: Array<any>;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal, private utilsService: UtilsService, private trainingService: TrainingService, private toastr: ToastrService) { 
  }
  
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.TRAINING_VALIDATIONS = this.trainingService.TRAINING_VALIDATIONS;
  }

  get getItems() {
    return this.athleteList.reduce((acc, curr) => {
      acc[curr._id] = curr;
      return acc;
    }, {});
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  // From services
  compareObjects = this.utilsService.compareObjects;
  isValidStartDate = this.trainingService.isValidStartDate;
  isValidEndDate = this.trainingService.isValidEndDate;
  isSessionValidToSubmit = this.trainingService.isSessionValidToSubmit;
  isWeekValidToSubmit = this.trainingService.isWeekValidToSubmit;
  isTrainingValidToSubmit = this.trainingService.isTrainingValidToSubmit;
  areBasicTrainingInfosValidToSubmit = this.trainingService.areBasicTrainingInfosValidToSubmit;

  submit() {
    if(!this.areBasicTrainingInfosValidToSubmit(this.newTraining)) {
      this.toastr.warning("Creazione non riuscita: alcuni campi non sono correttamente valorizzati!");
      return;
    }

    this.modal.close(this.newTraining);
  }

  public openTrainingModal(content) {
    this.modal = this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" })
    this.modal.result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });

  }

}
