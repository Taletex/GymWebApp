import { Injectable } from '@angular/core';
import { Training } from 'src/app/model';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  constructor() { }

  public trainingDecorator(training: Training) {
    return;
  }
}
