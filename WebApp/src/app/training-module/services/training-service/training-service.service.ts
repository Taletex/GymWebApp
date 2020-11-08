import { Injectable } from '@angular/core';
import { Training, Week, Session, Exercise, Series, SessionExercise, PersonalRecord } from '@app/_models/training-model';
import * as _ from 'lodash';
import { saveAs } from 'file-saver';

@Injectable({
    providedIn: 'root'
})
export class TrainingService {

    constructor() { }

    public trainingDecorator(training: Training) {
        for(let i=0; i<training.oldVersions.length; i++) {
             if(typeof training.oldVersions[i] == "string") 
                training.oldVersions[i] = JSON.parse(training.oldVersions[i]);
        }
    }

    public trainingAntiDecorator(training: Training) {
        for(let i=0; i<training.oldVersions.length; i++) {
            if(typeof training.oldVersions[i] != "string") 
                training.oldVersions[i] = JSON.stringify(training.oldVersions[i]);
        }
    }

    /**
     * This function return a new training in which all the entities are replaced with their ids. Useful to send slim data to the backend.
     * @param fullTraining the training which entities need to be replaced with their ids
     */
    public replaceTrainingEntitiesWithIds(fullTraining: Training): any {
        let training = _.cloneDeep(fullTraining);

        if(training.author._id != undefined && training.author._id != null && training.author._id != "") 
            training.author = training.author._id;
        if(training.athlete._id != undefined && training.athlete._id != null && training.athlete._id != "") 
            training.athlete = training.athlete._id;

        for(let i=0; i<training.weeks.length; i++) {
            for(let j=0; j<training.weeks[i].sessions.length; j++) {
                for(let k=0; k<training.weeks[i].sessions[j].exercises.length; k++) {
                    if(training.weeks[i].sessions[j].exercises[k].exercise._id != undefined && training.weeks[i].sessions[j].exercises[k].exercise._id != null)
                        training.weeks[i].sessions[j].exercises[k].exercise = training.weeks[i].sessions[j].exercises[k].exercise._id;
                    else 
                        if((training.weeks[i].sessions[j].exercises[k].exercise == undefined || training.weeks[i].sessions[j].exercises[k].exercise == null || training.weeks[i].sessions[j].exercises[k].exercise == "") || 
                           (training.weeks[i].sessions[j].exercises[k].exercise.name == undefined || training.weeks[i].sessions[j].exercises[k].exercise.name == null || training.weeks[i].sessions[j].exercises[k].exercise.name == ""))
                            training.weeks[i].sessions[j].exercises.splice(k, 1);
                }

                if(training.weeks[i].sessions[j].exercises.length == 0)
                    training.weeks[i].sessions[j].exercises = []; 
            }
        }

        return training;
    }

    public prepareTrainingData(currentTraining: Training, originalTraining: Training): any {
        this.pushOldVersion(currentTraining, originalTraining);
        this.trainingAntiDecorator(currentTraining);
        return this.replaceTrainingEntitiesWithIds(currentTraining);
    }

    dateToString(date: Date): string {
        date = new Date(date);
        return (date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear());
    }

    trainingReadViewToString(training: Training, options: any): string {
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
        <div class='card-body p-0 d-flex' style='flex-wrap: wrap;'> \
    ";
        for (let i = 0; i < training.weeks.length; i++) {
            trainingToString = trainingToString + this.weekReadViewToString(training.weeks[i], i, options);
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

    weekReadViewToString(week: Week, index: number, options: any): string {
        let weekToString = "";
        weekToString = weekToString +
            "\
    <div class='card my-3 mx-0 p-0' style='border-color: rgba(0, 0, 0, 0.6) !important; " 
                                + ((index==0 || ((index+1)%options.format.weeksForRow!=0)) ? "margin-right: 0.1% !important; " : "") 
                                + ((options.format.weeksForRow == 1 || options.format.weeksForRow == 0 || options.format.weeksForRow == null) ? "flex: 0 0 100% !important;" : "")
                                + ((options.format.weeksForRow == 2) ? "flex: 0 0 49.95% !important" : "")
                                + ((options.format.weeksForRow == 3) ? "flex: 0 0 33.2666666667% !important" : "")
                                + ((options.format.weeksForRow == 4) ? "flex: 0 0 24.925% !important" : "")
                                + ((options.format.weeksForRow == 5) ? "flex: 0 0 19.92% !important" : "")
                                + ((options.format.weeksForRow == 6) ? "flex: 0 0 16.5833333333% !important" : "")
                                + ((options.format.weeksForRow == 7) ? "flex: 0 0 14.2% !important" : "")
                                + ((options.format.weeksForRow == 8) ? "flex: 0 0 12.4125% !important" : "")
        + "'> \
        <div class='card-header border border-dark bg-dark text-white'> \
            <h6 class='m-0'>WEEK " + (index + 1) + "</h6> \
            " + ((week.comment == null || week.comment == '') ? "" : ("<span>Commento: " + week.comment + " </span>")) + "\
        </div> \
        <div class='card-body border-0 p-0 row m-0'> \
    ";

        for (let i = 0; i < week.sessions.length; i++) {
            weekToString = weekToString + this.sessionReadViewToString(week.sessions[i], i, options);
        }

        weekToString = weekToString +
            " \
        </div> \
    </div> \
    ";

        return weekToString;
    }

    sessionReadViewToString(session: Session, index: number, options: any): string {
        let sessionToString = "";
        sessionToString = sessionToString +
            " \
    <div class='card border-0 col-12 p-0' style='box-shadow: 0px 2px 0px rgba(0,0,0,.5); border-radius: 0px !important; border: 0px !important'> \
        <div class='card-header m-0 px-0 border-0 text-white' style='background-color: rgba(0, 0, 0, 0.6) !important; border-radius: 0px !important;'> \
            <h6 class='m-0 px-3'>Sessione " + index + " - " + session.name + "</h6> \
            <div class='row m-0 px-3 py-0' style='font-size: small; font-style: italic;'> \
                <div class='col-4 px-0'> \
                    <span>Esercizio (variante)</span> \
                </div> \
                <div class='col-8 pr-0'> \
                    <div class='row m-0 d-flex'>" +
                        ((options.format.seriesFormat == 'seriesxrep') ? "<span>Serie × Ripetizioni</span>" : "<span>Ripetizioni × Serie</span>") +
                        "<span class='ml-auto'>Riposo</span> \
                    </div> \
                </div> \
            </div> \
        </div> \
        <div class='card-body p-0'> \
    ";

        for (let i = 0; i < session.exercises.length; i++) {
            sessionToString = sessionToString + this.exerciseReadViewToString(session.exercises[i], i, options);
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

    exerciseReadViewToString(sessionExercise: SessionExercise, index: number, options: any): string {
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

        for (let i = 0; i < sessionExercise.series.length; i++) {
            exerciseToString = exerciseToString + this.seriesReadViewToString(sessionExercise.series[i], i, options);
        }

        exerciseToString = exerciseToString +
            " \
        </div> \
    </div> \
    ";

        return exerciseToString;
    }

    seriesReadViewToString(series: Series, index: number, options: any): string {
        let seriesToString = "";
        seriesToString = seriesToString +
            " \
    <div class='row m-0 d-flex'> \
        <span>" + ((options.format.seriesFormat == 'seriesxrep') ? (series.seriesNumber + " × " + series.repNumber) : (series.repNumber + " × " + series.seriesNumber)) + " @ " + series.weight + series.measure + "</span> \
        <span class='ml-auto'>" + series.rest + "s</span> \
    </div> \
    ";

        return seriesToString;
    }

    convertPercentage(training: Training, personalRecords: PersonalRecord[], newMeasure: string): Training {
        let currentTraining = _.cloneDeep(training)
        for (let week of currentTraining.weeks) {
            for (let session of week.sessions) {
                for (let sessionExercise of session.exercises) {

                    // Get pr if it exists
                    let currentPr;
                    for (let pr of personalRecords) {
                        if (pr.exercise._id == sessionExercise.exercise._id)
                            currentPr = _.cloneDeep(pr);
                    }

                    // If the pr exists, then convert %
                    if (currentPr && currentPr.oneRepPR.weight > 0) {
                        for (let series of sessionExercise.series) {
                            if (series.measure == '%') {
                                series.measure = newMeasure;

                                if (newMeasure == currentPr.oneRepPR.measure) {
                                    series.weight = (Math.round(((currentPr.oneRepPR.weight * series.weight / 100) + Number.EPSILON) * 100) / 100);
                                }
                                else {
                                    if (newMeasure == 'lbs') {
                                        series.weight = (Math.round(((currentPr.oneRepPR.weight * 2.2 * series.weight / 100) + Number.EPSILON) * 100) / 100);
                                    }
                                    else if (newMeasure == 'kg')
                                        series.weight = (Math.round(((currentPr.oneRepPR.weight / 2.2 * series.weight / 100) + Number.EPSILON) * 100) / 100);
                                }
                            }
                        }
                    }

                }
            }
        }

        return currentTraining;
    }

    /**
     * Converts all weights of a training from kg to lbs
     * @param training the training to convert from kg to lbs
     */
    convertKgToLbs(training: Training): Training {
        let currentTraining = _.cloneDeep(training)
        for (let week of currentTraining.weeks) {
            for (let session of week.sessions) {
                for (let sessionExercise of session.exercises) {
                    for (let series of sessionExercise.series) {
                        if (series.measure == 'kg') {
                            series.measure = 'lbs';
                            series.weight = (Math.round(((series.weight * 2.2) + Number.EPSILON) * 100) / 100);
                        }
                    }
                }
            }
        }

        return currentTraining;
    }

    /**
     * Converts all weights of a training from lbs to kg
     * @param training the training to convert from lbs to kg
     */
    convertLbsToKg(training: Training): Training {
        let currentTraining = _.cloneDeep(training)
        for (let week of currentTraining.weeks) {
            for (let session of week.sessions) {
                for (let sessionExercise of session.exercises) {
                    for (let series of sessionExercise.series) {
                        if (series.measure == 'lbs') {
                            series.measure = 'kg';
                            series.weight = (Math.round(((series.weight / 2.2) + Number.EPSILON) * 100) / 100);
                        }
                    }
                }
            }
        }

        return currentTraining;
    }

    exportTraining(training: Training) {
        let blob = new Blob([JSON.stringify(training)], { type: " application/json;charset=utf-8" });
        saveAs(blob, "training_" + training._id + ".json");
    }

    /** Unused */
    importTraining(jsonTraining: Blob) {
    }

    /**
     * Push a training in string value in the oldVersion field of a training
     * @param training 
     * @param oldTraining 
     */
    pushOldVersion(training: Training, oldTraining: Training) {
        let trainingToPush = JSON.stringify(this.replaceTrainingEntitiesWithIds(oldTraining));

        if(training.oldVersions.length < 2)
            training.oldVersions.push(trainingToPush)
        else {
            training.oldVersions.splice(0, 1);
            training.oldVersions.push(trainingToPush);
        }
            
    }

    /**
     * Returns true if an user is the author or the athlete of a certain training
     * @param userId the id of the user to check
     * @param training the training where we need to check the user
     */
    isUserAuthorOrAthleteOfTraining(userId: string, training: Training): boolean {
        return (training.author._id == userId || training.athlete._id == userId);
    }
}
