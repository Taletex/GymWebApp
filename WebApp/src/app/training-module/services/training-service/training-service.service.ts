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
        if(training.athletes != null && training.athletes.length > 0) {
            for(let i=0; i<training.athletes.length; i++) {
                if(training.athletes[i]._id != undefined && training.athletes[i]._id != null && training.athletes[i]._id != "") 
                training.athletes[i] = training.athletes[i]._id;
            }
        }
        
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

                    // If the exact pr does not exists, take the pr with the same name, if it exists
                    if(currentPr == null) {
                        for (let pr of personalRecords) {
                            if (pr.exercise.name == sessionExercise.exercise.name)
                                currentPr = _.cloneDeep(pr);
                        } 
                    }

                    // If the exact pr or a pr with the same exercise name exists, then convert %
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
        return (training.author._id == userId || (_.find(training.athletes, function(a) { return a._id == userId }) != undefined));
    }
}
