import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Exercise, EXERCISE_GROUPS, TRAINING_STATES, TRAINING_TYPES } from '@app/_models/training-model';

@Component({
  selector: 'app-exercise-modal',
  templateUrl: './exercise-modal.component.html',
  styleUrls: ['./exercise-modal.component.scss']
})
export class ExerciseModalComponent implements OnInit {
  public closeResult: string;
  public groupDropdownSettings = {};
  public disciplineDropdownSettings = {};
  public TRAINING_TYPES = TRAINING_TYPES;
  public EXERCISE_GROUPS = EXERCISE_GROUPS;
  public exerciseGroupsList = Object.values(this.EXERCISE_GROUPS);
  public exerciseDisciplinesList = Object.values(this.TRAINING_TYPES);
  @Input() newExercise: Exercise;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    this.groupDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      selectAllText: 'Seleziona Tutti',
      unSelectAllText: 'Deseleziona Tutti',
      allowSearchFilter: true
    };
    this.disciplineDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      selectAllText: 'Seleziona Tutti',
      unSelectAllText: 'Deseleziona Tutti',
      allowSearchFilter: true
    };
  }

  get getGroupItems() {
    return this.exerciseGroupsList.reduce((acc, curr) => {
      acc[curr] = curr;
      return acc;
    }, {});
  }

  get getDisciplineItems() {
    return this.exerciseDisciplinesList.reduce((acc, curr) => {
      acc[curr] = curr;
      return acc;
    }, {});
  }

  public openExerciseModal(content) {
    this.modalService.open(content, { centered: true, scrollable: true, backdrop: "static" }).result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }
}
