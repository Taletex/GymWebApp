import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Session, Training, Week } from '@app/_models/training-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();
  options = {format: {seriesFormat:'seriesxrep'}};

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    
  }

  public openSessionModal(content) {
    this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" }).result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }

  public downloadSession() {
    html2canvas(document.getElementById("sessionContainer")).then(canvas => {
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
    var prtContent = document.getElementById("sessionContainer");
    var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    WinPrint.document.write(prtContent.innerHTML);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  }

}
