import { Injectable } from '@angular/core';
import { Training, Week, Session, Exercise, Series, SessionExercise, PersonalRecord, TRAINING_STATES } from '@app/_models/training-model';
import * as _ from 'lodash';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class TrainingService {

    public TRAINING_VALIDATIONS: any = {MAX_SESSION_NAME_LENGTH: 50, MAX_SESSION_COMMENT_LENGTH: 100, MAX_SERIES_NUMBER: 99999, MIN_SERIES_NUMBER: 1, MAX_REP_NUMBER: 99999, MIN_REP_NUMBER: 1, MAX_WEIGHT_NUMBER: 99999, MIN_WEIGHT_NUMBER: 0, 
                                        MAX_REST_TIME: 99999, MIN_REST_TIME: 0, MAX_DATE: "2100-01-01T00:00", MAX_WEEK_COMMENT_LENGTH: 500, MAX_TRAINING_COMMENT_LENGTH: 1000, MIN_TYPE_LENGTH: 1, MAX_TYPE_LENGTH: 50};
    
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

    public trainingExerciseDecorator(training: Training, exerciseList: any[]) {
        for(let w of training.weeks) {
            for(let s of w.sessions) {
                for(let e of s.exercises) {
                    if(e.exercise.name == null) {
                        e.exercise = _.cloneDeep(exerciseList.find((exercise) => {return exercise._id == e.exercise}));
                    }
                }
            }
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
        oldTraining.oldVersions = [];
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


    /* === COPY FUNCTIONS === */
    copyWeek(w1: Week, w2: Week) {
        w1.comment = w2.comment;
        w1.sessions = _.cloneDeep(w2.sessions);
    }

    copySession(s1: Session, s2: Session) {
        s1.name = s2.name;
        s1.comment = s2.comment;
        s1.startDate = s2.startDate;
        s1.endDate = s2.endDate;
        s1.exercises = _.cloneDeep(s2.exercises);
    }

    copySessionExercise(se1: SessionExercise, se2: SessionExercise) {
        se1.exercise = _.cloneDeep(se2.exercise);
        se1.series = _.cloneDeep(se2.series);
    }

    copyExercise(e1: Exercise, e2: Exercise) {
        e1.name = e2.name;
        e1.variant = _.cloneDeep(e2.variant);
        e1.description = e2.description;
        e1.creator = _.cloneDeep(e2.creator);
    }
    

    /* === VALIDATION FUNCTIONS === */
    isValidStartDate(startDate: Date): boolean {
        return !(moment(startDate).isAfter(this.TRAINING_VALIDATIONS.MAX_DATE));
    }
    isValidEndDate(startDate: Date, endDate: Date): boolean {
        return !(moment(endDate).isBefore(startDate) || moment(endDate).isAfter(this.TRAINING_VALIDATIONS.MAX_DATE));
    }

    isSessionValidToSubmit(session: Session): boolean {

        // session name and comment lengths must be less than their limits
        if(session.name.length > this.TRAINING_VALIDATIONS.MAX_SESSION_NAME_LENGTH || session.comment.length > this.TRAINING_VALIDATIONS.MAX_SESSION_COMMENT_LENGTH)
            return false;

        // end date must be after start date, end date and start date must be before 2100-01-01
        if(moment(session.endDate).isBefore(session.startDate) || moment(session.endDate).isAfter(this.TRAINING_VALIDATIONS.MAX_DATE) || moment(session.startDate).isAfter(this.TRAINING_VALIDATIONS.MAX_DATE))
            return false;
        
        // each exercise
        for(let e of session.exercises) {
            // exercise must be defined
            if(!e.exercise.name)
                return false;
            
            for(let s of e.series) {
                // series, rep, weight and rest must be defined and must be less and more than their limits
                if( 
                    (s.seriesNumber == null || s.seriesNumber < this.TRAINING_VALIDATIONS.MIN_SERIES_NUMBER || s.seriesNumber > this.TRAINING_VALIDATIONS.MAX_SERIES_NUMBER) ||
                    (s.repNumber == null || s.repNumber < this.TRAINING_VALIDATIONS.MIN_REP_NUMBER || s.repNumber > this.TRAINING_VALIDATIONS.MAX_REP_NUMBER) ||
                    (s.weight == null || s.weight < this.TRAINING_VALIDATIONS.MIN_WEIGHT_NUMBER || s.weight > this.TRAINING_VALIDATIONS.MAX_WEIGHT_NUMBER) ||
                    (s.rest == null || s.rest < this.TRAINING_VALIDATIONS.MIN_REST_TIME || s.rest > this.TRAINING_VALIDATIONS.MAX_REST_TIME)
                )
                    return false;
            }
        }

        return true;

    }

    isWeekValidToSubmit(week: Week): boolean {

        // week comment length must be less than its limit
        if(week.comment.length > this.TRAINING_VALIDATIONS.MAX_WEEK_COMMENT_LENGTH)
            return false;
        
        // all week sessions must be valid
        for(let s of week.sessions) {
            if(!this.isSessionValidToSubmit(s))
                return false;
        }

        return true;

    }

    isTrainingValidToSubmit(training: Training): boolean {

        // all basic training infos must be valid
        if(!this.areBasicTrainingInfosValidToSubmit(training))
            return false;

        // all training weeks must be valid
        for(let w of training.weeks) {
            if(!this.isWeekValidToSubmit(w))
                return false;
        }

        return true;
    }
    
    areBasicTrainingInfosValidToSubmit(training: Training): boolean {
        
        // training comment length must be less than its limit
        if(training.comment.length > this.TRAINING_VALIDATIONS.MAX_TRAINING_COMMENT_LENGTH)
            return false;

        // training state and discipline must be valid
        if(training.state == null || !Object.values(TRAINING_STATES).includes(training.state) || training.type == null || training.type == '' || training.type.length < this.TRAINING_VALIDATIONS.MIN_TYPE_LENGTH || training.type.length > this.TRAINING_VALIDATIONS.MAX_TYPE_LENGTH)
            return false;

        // end date must be after start date, end date and start date must be before 2100-01-01
        if(moment(training.endDate).isBefore(training.startDate) || moment(training.endDate).isAfter(this.TRAINING_VALIDATIONS.MAX_DATE) || moment(training.startDate).isAfter(this.TRAINING_VALIDATIONS.MAX_DATE))
            return false;

        // athlete list must not be empty
        if(training.athletes.length == 0)
            return false;

        return true;
    }
}
