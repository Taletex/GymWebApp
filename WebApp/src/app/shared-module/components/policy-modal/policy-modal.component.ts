import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-policy-modal',
  templateUrl: './policy-modal.component.html',
  styleUrls: ['./policy-modal.component.scss']
})
export class PolicyModalComponent implements OnInit {
  
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();
  bLogged: boolean = false;

  constructor(private modalService: NgbModal, private accountService: AccountService) { }

  ngOnInit(): void {
    this.bLogged = this.accountService.accountValue.jwtToken ? true : false;
  }

  public openPolicyModal(content) {
    let modal = this.modalService.open(content, { size: "lg", centered: true, scrollable: true});
    
    modal.result.then((result) => {
      this.onClose.emit(result);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }

}
