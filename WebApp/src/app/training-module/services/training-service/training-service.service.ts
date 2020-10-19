import { Injectable } from '@angular/core';
import { Training, Week, Session, Exercise, Series, SessionExercise, PersonalRecord } from '@app/_models/training-model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  constructor() { }

  public trainingDecorator(training: Training) {
    return;
  }

  dateToString(date: Date): string {
      date = new Date(date);
      return (date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear());
  }

  trainingReadViewToString(training: Training): string {
    let trainingToString = "";
    trainingToString = trainingToString + 
    "\
    <div class='card w-100 border-0'> \
        <div class='card-header border bg-dark text-white' style='border-radius: 5px !important;'> \
            <h5>ALLENAMENTO " + training.type + " " + training._id + " </h5> \
            <h6 class='m-0'>Allenamento creato da " + training.author.name + " " + training.author.surname + " il " + this.dateToString(training.creationDate) + " </h6> \
            <h6 class='m-0'> \
                <span>Atleta " + training.athlete.name + " " + training.athlete.surname + " (" + this.dateToString(training.athlete.dateOfBirth) + " • " + training.athlete.bodyWeight + "kg)</span> \
                <span class='m-0'>, dal " + this.dateToString(training.startDate) + " al " + this.dateToString(training.endDate) + "</span> \
            </h6> \
            " + ((training.comment == null || training.comment == '') ? "" : ("<span>Commento: " + training.comment + " </span>")) + "\
        </div> \
        <div class='card-body p-0 '> \
    ";
    for(let i=0; i<training.weeks.length; i++) {
        trainingToString = trainingToString + this.weekReadViewToString(training.weeks[i], i);
    }

    trainingToString = trainingToString + 
    " \
        </div> \
        <div class='mceNonEditable'> \
            <span>Allenamento creato sulla piattaforma <em>MyTrainingPlatform</em></span> \
        </div> \
    </div> \
    ";
    
    return trainingToString;
  }

  weekReadViewToString(week: Week, index: number): string {
    let weekToString = "";
    weekToString = weekToString +
    "\
    <div class='card my-3' style='border-color: rgba(0, 0, 0, 0.6) !important;'> \
        <div class='card-header border border-dark bg-dark text-white'> \
            <h6 class='m-0'>WEEK " + (index+1) + "</h6> \
            " + ((week.comment == null || week.comment == '') ? "" : ("<span>Commento: " + week.comment + " </span>")) + "\
        </div> \
        <div class='card-body border-0 p-0 '> \
    ";
    
    for(let i=0; i<week.sessions.length; i++) {
        weekToString = weekToString + this.sessionReadViewToString(week.sessions[i], i);
    }
    
    weekToString = weekToString +
    " \
        </div> \
    </div> \
    ";

    return weekToString;
  }

  sessionReadViewToString(session: Session, index: number): string {
    let sessionToString = "";
    sessionToString = sessionToString +
    " \
    <div class='card border-0' style='box-shadow: 0px 2px 0px rgba(0,0,0,.5); border-radius: 0px !important; border: 0px !important'> \
        <div class='card-header m-0 px-0 border-0 text-white' style='background-color: rgba(0, 0, 0, 0.6) !important; border-radius: 0px !important;'> \
            <h6 class='m-0 px-3'>Sessione " + index + " - " + session.name + "</h6> \
            <div class='row m-0 px-3 py-0' style='font-size: small; font-style: italic;'> \
                <div class='col-4 px-0'> \
                    <span>Esercizio (variante)</span> \
                </div> \
                <div class='col-8 pr-0'> \
                    <div class='row m-0 d-flex'> \
                        <span>Serie × Ripetizioni</span> \
                        <span class='ml-auto'>Riposo</span> \
                    </div> \
                </div> \
            </div> \
        </div> \
        <div class='card-body p-0'> \
    ";

    for(let i=0; i<session.exercises.length; i++) {
        sessionToString = sessionToString + this.exerciseReadViewToString(session.exercises[i], i);
    }

    sessionToString = sessionToString +
    " \
        </div> \
        <div class='card-footer border-0 bg-white px-3'> \
            <span>" + ((session.comment == null || session.comment == '') ? 'Nessun commento' : ('Commento: ' + session.comment)) + "</span> \
        </div> \
    </div> \
    ";

    return sessionToString;
  }

  exerciseReadViewToString(sessionExercise: SessionExercise, index: number): string {
    let exerciseToString = "";
    exerciseToString = exerciseToString +
    " \
    <div class='row m-0 px-3 py-1 border border-left-0 border-right-0 border-top-0'> \
        <div class='col-4 px-0'> \
            <div><span> " + sessionExercise.exercise.name + " (" + sessionExercise.exercise.variant.name + ")</span></div> \
            <div><span> " + sessionExercise.exercise.description + "</span></div> \
        </div> \
        <div class='col-8 pr-0'> \
    ";

    for(let i=0; i<sessionExercise.series.length; i++) {
        exerciseToString = exerciseToString + this.seriesReadViewToString(sessionExercise.series[i], i);
    }

    exerciseToString = exerciseToString + 
    " \
        </div> \
    </div> \
    ";

    return exerciseToString;
  }

  seriesReadViewToString(series: Series, index: number): string {
    let seriesToString = "";
    seriesToString = seriesToString +
    " \
    <div class='row m-0 d-flex'> \
        <span>" + series.seriesNumber + " × " + series.repNumber + " @ " + series.weight + series.measure + "</span> \
        <span class='ml-auto'>" + series.rest + "s</span> \
    </div> \
    ";

    return seriesToString;
  }

  convertPercentage(training: Training, personalRecords: PersonalRecord[], newMeasure: string): Training {
    let currentTraining = _.cloneDeep(training)
    for(let week of currentTraining.weeks) {
        for(let session of week.sessions) {
            for(let sessionExercise of session.exercises) {

                // Get pr if it exists
                let currentPr;
                for(let pr of personalRecords) {
                    if(pr.exercise._id == sessionExercise.exercise._id)
                        currentPr = _.cloneDeep(pr);
                }

                // If the pr exists, then convert %
                if(currentPr && currentPr.oneRepPR.weight > 0) {
                    for(let series of sessionExercise.series) {
                        if(series.measure == '%') {
                            series.measure = newMeasure;

                            if(newMeasure == currentPr.oneRepPR.measure) {
                                series.weight = currentPr.oneRepPR.weight * series.weight / 100;
                            }
                            else {
                                if(newMeasure=='lbs') {
                                    series.weight = currentPr.oneRepPR.weight * 2.2 * series.weight / 100;
                                }
                                else if(newMeasure=='kg')
                                    series.weight = currentPr.oneRepPR.weight / 2.2 * series.weight / 100;
                            }
                        }
                    }
                }
                
            }
        }
    }

    return currentTraining;
  }


}
