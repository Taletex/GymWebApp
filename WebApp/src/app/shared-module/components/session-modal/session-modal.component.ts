import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Session, Training, Week } from '@app/_models/training-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GeneralService, VIEW_TYPES } from '@app/_services/general-service/general-service.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-session-modal',
  templateUrl: './session-modal.component.html',
  styleUrls: ['./session-modal.component.scss']
})


export class SessionModalComponent implements OnInit {

  @Input() training: Training;
  @Input() week: Week;
  @Input() session: Session;
  @Input() weekIndex: number;
  @Input() sessionIndex: number;
  @Input() options: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();
  defaultOptions: any;
  VIEW_TYPES = VIEW_TYPES;

  constructor(private modalService: NgbModal, private generalService: GeneralService) { }

  ngOnInit(): void {
  }

  public openSessionModal(content) {
    let modal = this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" });
    
    modal.result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }

  public downloadSession() {
    html2canvas(document.getElementById("sessionModal")).then(canvas => {
      let fileWidth = 208;
    let fileHeight = canvas.height * fileWidth / canvas.width;
    
    const FILEURI = canvas.toDataURL('image/png')
    let PDF = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    PDF.addImage(FILEURI, 'JPEG', 0, 0, fileWidth, fileHeight)
    PDF.save('angular-demo.pdf');  
    }); 
  }

  public printSession() {
    let prtContent: string;
    switch(this.options.currentViewType) {
      case VIEW_TYPES.TRAINING:
        prtContent = this.generalService.trainingReadViewToString(this.training, this.options) 
        break;
      case VIEW_TYPES.WEEK:
        prtContent = this.generalService.weekReadViewToString(this.week, this.weekIndex, this.options);
        break;
      case VIEW_TYPES.SESSION:
        prtContent = this.generalService.sessionReadViewToString(this.session, this.sessionIndex, this.options);
        break;
    }
    prtContent = "<div style='font-family:Arial, Helvetica, sans-serif;'>" + prtContent + "</div>";

    var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    WinPrint.document.write(prtContent);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  }

  public setView(viewType: VIEW_TYPES) {
    this.options.currentViewType = viewType;
  }

  clampWeeksForRowValue() {
    console.log(this.options);
    if(this.options.format.weeksForRow <= 0) 
      this.options.format.weeksForRow = 1;
    else
      if(this.options.format.weeksForRow > 8)
        this.options.format.weeksForRow = 8;
  }

  initOptions() {
    if(!this.defaultOptions)
    this.defaultOptions = _.cloneDeep(this.options);
  }

  setDefaultoptions() {
    this.options = _.cloneDeep(this.defaultOptions);
  }
  

}
