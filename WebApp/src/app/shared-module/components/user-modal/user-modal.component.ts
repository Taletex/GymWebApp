import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '@app/_models/training-model';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss']
})
export class UserModalComponent implements OnInit {

  public closeResult: string;
  @Input() newUser: User;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  public openUserModal(content) {
    this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" }).result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }
}
