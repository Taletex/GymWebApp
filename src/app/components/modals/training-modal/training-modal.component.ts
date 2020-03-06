import { Component, OnInit, Input } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-training-modal',
  templateUrl: './training-modal.component.html',
  styleUrls: ['./training-modal.component.scss']
})
export class TrainingModalComponent implements OnInit {
  closeResult: string;
  @Input() training: object;

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
  }

  openTrainingModal(content) {
    this.modalService.open(content, {size: 'lg', backdrop: 'static', keyboard: false}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  pushSeries(exercize: any) {
    if (exercize && exercize.quantita != null) {
      exercize.quantita.push({serie: '', rep: '', peso: '', misura: '%', recupero: '1m30s'});
    } else {
      console.log('Error: "quantita" is not defined');
    }
  }

  pushExercize(training: any) {
    if (training && training.scheda != null) {
      training.scheda.push({esercizio: '', tipo: '', quantita: [{serie: '', rep: '', peso: '', misura: '%', recupero: '1m30s'} ]});
    } else {
      console.log('Error: "scheda" is not defined');
    }
  }
}
