import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneralService } from '@app/_services/general-service/general-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-crop-image-modal',
  templateUrl: './crop-image-modal.component.html',
  styleUrls: ['./crop-image-modal.component.scss']
})
export class CropImageModalComponent implements OnInit {

  @Input() imgList: any[];
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();
  
  constructor(private modalService: NgbModal, private generalService: GeneralService) { }

  ngOnInit(): void {
  }

  public openCropImageModal(content) {
    let modal = this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" });
    
    modal.result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }

}
