import { Injectable } from '@angular/core';
import { Exercise } from '@app/_models/training-model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  public EXERCISE_VALIDATIONS: any = {MAX_EXERCISE_NAME_LENGTH: 50, MAX_EXERCISE_DESCRIPTION_LENGTH: 100, MAX_VARIANT_NAME_LENGTH: 50, MIN_INTENSITY_COEFFICIENT_NUMBER: 0, MAX_INTENSITY_COEFFICIENT_NUMBER: 99999};

  constructor() { }

  isExerciseValidToSubmit(exercise: Exercise): boolean {
    
    // exercise name must be defined and its length must be less than its limit
    if(!exercise.name || exercise.name.length > this.EXERCISE_VALIDATIONS.MAX_EXERCISE_NAME_LENGTH)
      return false;

    // exercise variant name length must be less than its limit
    if(exercise.variant.name && exercise.variant.name.length > this.EXERCISE_VALIDATIONS.MAX_VARIANT_NAME_LENGTH)
      return false;
    
    // exercise variant intensity coefficient must be defined and in its range limit
    if(exercise.variant.intensityCoefficient == null || exercise.variant.intensityCoefficient < this.EXERCISE_VALIDATIONS.MIN_INTENSITY_COEFFICIENT_NUMBER || exercise.variant.intensityCoefficient > this.EXERCISE_VALIDATIONS.MAX_INTENSITY_COEFFICIENT_NUMBER)
      return false;
    
    // exercise description length must be less than its limit
    if(exercise.description.length > this.EXERCISE_VALIDATIONS.MAX_EXERCISE_DESCRIPTION_LENGTH)
      return false;
    
    return true;
  }
}
