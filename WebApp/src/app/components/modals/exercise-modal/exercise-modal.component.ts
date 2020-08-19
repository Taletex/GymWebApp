import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Exercise } from 'src/app/model';

@Component({
  selector: 'app-exercise-modal',
  templateUrl: './exercise-modal.component.html',
  styleUrls: ['./exercise-modal.component.scss']
})
export class ExerciseModalComponent implements OnInit {
  public closeResult: string;
  @Input() newExercise: Exercise;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  public openExerciseModal(content) {
    this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" }).result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }
}
