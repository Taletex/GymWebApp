import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Series, Session, SessionExercise, Training, Week } from '@app/_models/training-model';
import * as _ from 'lodash';
import * as $ from 'jquery';

export enum DEVICE_TYPE {
    TABLET = 'tablet',
    SMARTPHONE = 'smartphone',
    DESKTOP = 'desktop'
}

export enum PAGEMODE {
    READONLY = "readonly",
    WRITE = "write",
    STATS = "stats"
}

export enum PAGES {
    TRAININGS = "trainings",
    EXERCISES = "exercises",
    USERS = "users",
    PROFILES = "userprofile",
    ACCOUNTS = "accounts"
}

export enum USERPROFILE_SECTIONS {
    USER_INFORMATIONS = 0,
    PERSONAL_RECORDS = 1,
    LINKS = 2,
    SETTINGS = 3,
    ACCOUNT = 4
}

export class PageStatus {
    public trainings: string;
    public exercises: string;
    public users: string;
    public userprofile: string;
    public accounts: string;

    constructor(trainings: string = PAGEMODE.READONLY, exercises: string = PAGEMODE.READONLY, users: string = PAGEMODE.READONLY, userprofile: string = PAGEMODE.READONLY, accounts: string = PAGEMODE.READONLY) {
        this.trainings = trainings;
        this.exercises = exercises;
        this.users = users;
        this.userprofile = userprofile;
        this.accounts = accounts;
    }
}

export enum NOTIFY_MEDIUM_TYPE {
    MYTRAININGPLATFORM = "mytrainingplatform",
    EMAIL = "email",
    TELEGRAM = "telegram"
}

export enum NOTIFICATION_TYPE {
    COACH_REQUEST = "coach_request",
    ATHLETE_REQUEST = "athlete_request",
    REQUEST_SUCCESS = "request_success",
    REQUEST_REFUSE = "request_refuse",
    CANCEL_ATHLETE_TO_COACH_LINK = "cancel_athlete_to_coach_link",
    CANCEL_COACH_TO_ATHLETE_LINK = "cancel_coach_to_athlete_link",
    CANCEL_ATHLETE_TO_COACH_LINK_REQUEST = "cancel_athlete_to_coach_link_request",
    CANCEL_COACH_TO_ATHLETE_LINK_REQUEST = "cancel_coach_to_athlete_link_request",
    TRAINING_CREATED = "training_created",
    TRAINING_MODIFIED = "training_modified",
    DISMISS = "dismiss"
}

export const NOTIFICATION_TYPE_NAMES = {
    coach_request: "Richiesta Coach",
    athlete_request: "Richiesta Atleta",
    request_success: "Richiesta accettata",
    request_refuse: "Richiesta rifiutata",
    cancel_athlete_to_coach_link: "Cancella collegamento Atleta → Coach",
    cancel_coach_to_athlete_link: "Cancella collegamento Coach → Atleta",
    cancel_athlete_to_coach_link_request: "Cancella richiesta collegamento Atleta → Coach",
    cancel_coach_to_athlete_link_request: "Cancella richiesta collegamento Coach → Atleta",
    training_created: "Allenamento creato",
    training_modified: "Allenamento modificato",
    dismiss: "Visualizza"
}

export const NOTIFICATION_ONLY_DISMISS = [
    NOTIFICATION_TYPE.REQUEST_SUCCESS,
    NOTIFICATION_TYPE.REQUEST_REFUSE,
    NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK,
    NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK,
    NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK_REQUEST,
    NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK_REQUEST,
    NOTIFICATION_TYPE.TRAINING_CREATED,
    NOTIFICATION_TYPE.TRAINING_MODIFIED,
    NOTIFICATION_TYPE.DISMISS,
]

export enum VIEW_TYPES {
    SESSION = 'sessione',
    WEEK = 'settimana',
    TRAINING = 'allenamento'
};

@Injectable({
    providedIn: 'root'
})
export class GeneralService {

    public pageStatus: PageStatus;
    public deviceType: DEVICE_TYPE;
    constructor(private router: Router) {
        this.initPageStatus();
        this.deviceType = this.getDeviceType();
        console.log(this.pageStatus);
    }

    openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
        this.setPageStatus(mode, page);
        let fullPage = page == PAGES.ACCOUNTS ? ("admin/" + page) : page;
        let options = id ? ([fullPage, id]) : [fullPage];

        this.router.navigate(options,{skipLocationChange: false});
        // this.router.navigateByUrl(fullPage + (id ? ("/" + id) : ""), { skipLocationChange: true }).then(() => {
        //     this.router.navigate(options);
        // });
        this.router.navigate(options);

        return;
    }

    initPageStatus() {
        if (typeof (Storage) !== "undefined") {
            if (!sessionStorage.pageStatus)
                sessionStorage.pageStatus = JSON.stringify(new PageStatus());

            this.pageStatus = JSON.parse(sessionStorage.pageStatus);
        } else {
            this.pageStatus = new PageStatus();
        }
    }

    setPageStatus(mode: PAGEMODE, page: PAGES) {
        if(page == PAGES.PROFILES)
            page = PAGES.USERS;
        this.pageStatus[page] = mode;
        if (typeof (Storage) !== "undefined")
            sessionStorage.pageStatus = JSON.stringify(this.pageStatus);
    }

    getPageStatus(): PageStatus {
        return this.pageStatus;
    }


    /* ==== Convert Training to HTML String FUNCTIONS ==== */
    
    /**
     * Convert Training to HTML
     * @param training 
     * @param options 
     */
    trainingReadViewToString(training: Training, options: any): string {
        let trainingToString = "";
        trainingToString = trainingToString +
            "\
            <div class='card w-100 border-0' style='position: relative; display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid rgba(0, 0, 0, 0.125); border-radius: 0.25rem; width: 100% !important; border: 0px !important;'> \
                <div class='card-header border bg-dark text-white' style='color: white !important; border: 1px solid #dee2e6 !important; padding: 0.75rem 1.25rem; margin-bottom: 0; background-color: rgba(0, 0, 0, 0.03); border-bottom: 1px solid rgba(0, 0, 0, 0.125); border: 0px !important; color: white !important; border-radius: 5px !important; background-color: #343a40 !important'> \
                    <h5>ALLENAMENTO " + training.type + " " + training._id + " </h5> \
                    <h6 class='m-0' style='margin: 0px !important'>Allenamento creato da " + training.author.name + " " + training.author.surname + " il " + this.dateToString(training.creationDate) + ", durata dal " + this.dateToString(training.startDate) + " al " + this.dateToString(training.endDate) + "</h6> \
                    <h6 class='m-0' style='margin: 0px !important'>";
                if (options.currentUser != null && options.currentUser._id == training.author._id) {
                    trainingToString = trainingToString +
                        "<span>Atleti ";
                    for (const [idx, athlete] of training.athletes.entries()) {
                        trainingToString = trainingToString +
                            "<span>" + athlete.name + " " + athlete.surname + " (" + this.dateToString(athlete.dateOfBirth) + " • " + athlete.bodyWeight + "kg)" + (idx != training.athletes.length - 1 ? ", " : "") + "</span>";
                    }
                    trainingToString = trainingToString +
                        "</span>";
                } else if (options.currentUser != null) {
                    trainingToString = trainingToString +
                        "<span>Atleta " + options.currentUser.name + " " + options.currentUser.surname + " (" + this.dateToString(options.currentUser.dateOfBirth) + " • " + options.currentUser.bodyWeight + "kg)</span>";
                }
                trainingToString = trainingToString +
                    "\
                    </h6> \
                    " + ((training.comment == null || training.comment == '') ? "" : ("<span>Commento: " + training.comment + " </span>")) + "\
                </div> \
                <div class='card-body p-0 d-flex' style='-ms-flex: 1 1 auto; flex: 1 1 auto; min-height: 1px; padding: 1.25rem; padding: 0px !important; flex-wrap: wrap; display: -ms-flexbox !important; display: flex !important;'> \
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

    /**
     * Convert Week to HTML
     * @param week 
     * @param index 
     * @param options 
     */
    weekReadViewToString(week: Week, index: number, options: any): string {
        let weekToString = "";
        weekToString = weekToString +
            "\
            <div class='card my-3 mx-0 p-0' style='margin-left: 0px !important; margin-right: 0px !important; padding: 0px !important; position: relative; display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid rgba(0, 0, 0, 0.125); border-radius: 0.25rem; margin-top: 1rem !important; margin-bottom: 1rem !important; border-color: rgba(0, 0, 0, 0.6) !important; "
                        + ((index == 0 || ((index + 1) % options.format.weeksForRow != 0)) ? "margin-right: 0.1% !important; " : "")
                        + ((options.format.weeksForRow == 1 || options.format.weeksForRow == 0 || options.format.weeksForRow == null) ? "flex: 0 0 100% !important;" : "")
                        + ((options.format.weeksForRow == 2) ? "flex: 0 0 49.95% !important; font-size: 95% !important;" : "")
                        + ((options.format.weeksForRow == 3) ? "flex: 0 0 33.2666666667% !important; font-size: 90% !important;" : "")
                        + ((options.format.weeksForRow == 4) ? "flex: 0 0 24.925% !important; font-size: 85% !important;" : "")
                        + ((options.format.weeksForRow == 5) ? "flex: 0 0 19.92% !important; font-size: 80% !important;" : "")
                        + ((options.format.weeksForRow == 6) ? "flex: 0 0 16.5833333333% !important; font-size: 75% !important;" : "")
                        + ((options.format.weeksForRow == 7) ? "flex: 0 0 14.2% !important; font-size: 70% !important;" : "")
                        + ((options.format.weeksForRow == 8) ? "flex: 0 0 12.4125% !important; font-size: 65% !important;" : "")
                        + "'> \
                <div class='card-header border border-dark bg-dark text-white' style='border-color: #343a40 !important; padding: 0.75rem 1.25rem; margin-bottom: 0; background-color: rgba(0, 0, 0, 0.03); border-bottom: 1px solid rgba(0, 0, 0, 0.125); border: 1px solid #dee2e6 !important; color: white !important; background-color: #343a40 !important'> \
                    <h6 class='m-0' style='margin: 0px !important'>WEEK " + (index + 1) + "</h6> \
                </div> \
                <div class='card-body border-0 p-0 m-0 bg-dark' style='-ms-flex: 1 1 auto; flex: 1 1 auto; min-height: 1px; padding: 1.25rem; border: 0px !important; padding: 0px !important; margin: 0px !important; background-color: #343a40 !important'> \
            ";

        for (let i = 0; i < week.sessions.length; i++) {
            weekToString = weekToString + this.sessionReadViewToString(week.sessions[i], i, options);
        }

        weekToString = weekToString +
            " \
                </div>";

        if(!options.format.bHideComments) {
            weekToString = weekToString + 
                "<div class='card-footer text-white bg-dark border-0' style='padding: 0.75rem 1.25rem; background-color: rgba(0, 0, 0, 0.03); border-top: 1px solid rgba(0, 0, 0, 0.125); color: white !important; border: 0px !important; background-color: #343a40 !important'> \
                    <span>" + ((week.comment == null || week.comment == '') ? 'Nessun commento' : ('Commento: ' + week.comment)) + "</span> \
                </div>";
        }

        weekToString = weekToString + 
            " \
            </div> \
            ";  


        return weekToString;
    }

    /**
     * Convert Session to HTML
     * @param session 
     * @param index 
     * @param options 
     */
    sessionReadViewToString(session: Session, index: number, options: any): string {
        let sessionToString = "";
        sessionToString = sessionToString +
        " \
        <div class='card border-0 col-12 p-0' style='position: relative; width: 100%; padding-right: 15px; padding-left: 15px; -ms-flex: 0 0 100%; flex: 0 0 100%; max-width: 100%; border: 0px !important; padding: 0px !important; position: relative; display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid rgba(0, 0, 0, 0.125); border-radius: 0.25rem; box-shadow: 0px 2px 0px rgba(0,0,0,.5); border-radius: 0px !important; border: 0px !important; height: " + options.format.maxSessionContainerHeight + "'> \
            <div class='card-header m-0 px-0 border-0 text-white' style='padding: 0.75rem 1.25rem; margin-bottom: 0; background-color: rgba(0, 0, 0, 0.03); border-bottom: 1px solid rgba(0, 0, 0, 0.125); margin: 0px !important; padding-left: 0px !important; padding-right: 0px !important; border: 0px !important; color: white !important; background-color: rgba(0, 0, 0, 0.6) !important; border-radius: 0px !important;'> \
                <h6 class='m-0 px-3' style='margin: 0px !important; padding-left: 1rem !important; padding-right: 1rem !important'>Sessione " + (index+1) + " - " + session.name + "</h6> \
                <div class='row m-0 px-3 py-0' style='display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; margin: 0px !important; padding: 0px 1rem 0px 1rem !important; font-size: small; font-style: italic; padding-left: 1rem !important; padding-right: 1rem !important'> \
                    <div class='col-4 px-0' style='margin: 0px !important; position: relative; width: 100%; padding-right: 15px; padding-left: 15px; -ms-flex: 0 0 33.333333%; flex: 0 0 33.333333%; max-width: 33.333333%; padding-left: 0px !important; padding-right: 0px !important'> \
                        <span>Esercizio (variante)</span> \
                    </div> \
                    <div class='col-8 px-0' style='margin: 0px !important; position: relative; width: 100%; padding-right: 15px; padding-left: 15px;  -ms-flex: 0 0 66.666667%; flex: 0 0 66.666667%; max-width: 66.666667%; padding-right: 0px !important; padding-left: 0px !important'> \
                        <div class='row m-0 d-flex' style='display: -ms-flexbox !important; display: flex !important; display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; margin:0px !important'>" +
                    ((options.format.seriesFormat == 'seriesxrep') ? "<span>Serie × Ripetizioni</span>" : "<span>Ripetizioni × Serie</span>") +
                    "<span class='ml-auto' style='margin-left: auto !important;'>Riposo</span> \
                        </div> \
                    </div> \
                </div> \
            </div> \
            <div class='card-body p-0' style='-ms-flex: 1 1 auto; flex: 1 1 auto; min-height: 1px; padding: 1.25rem; padding: 0px !important'> \
        ";

        for (let i = 0; i < session.exercises.length; i++) {
            sessionToString = sessionToString + this.exerciseReadViewToString(session.exercises[i], i, options);
        }

        sessionToString = sessionToString +
            " \
            <div style='height: 50px'></div> \
            </div>";

        if(!options.format.bHideComments) {
            sessionToString = sessionToString + 
            "<div class='card-footer border-0 bg-white px-3' style='padding: 0.75rem 1.25rem; background-color: rgba(0, 0, 0, 0.03); border-top: 1px solid rgba(0, 0, 0, 0.125); border: 0px !important; background-color: white !important; padding-left: 1rem !important; padding-right: 1rem !important'> \
                <span>" + ((session.comment == null || session.comment == '') ? 'Nessun commento' : ('Commento: ' + session.comment)) + "</span> \
            </div>";
        }

        sessionToString = sessionToString + 
        " \
        </div> \
        ";

        return sessionToString;
    }

    /**
     * Convert Exercise to HTML
     * @param sessionExercise 
     * @param index 
     * @param options 
     */
    exerciseReadViewToString(sessionExercise: SessionExercise, index: number, options: any): string {
        let exerciseToString = "";
        exerciseToString = exerciseToString +
            " \
            <div class='row m-0 px-3 py-1 border border-left-0 border-right-0 border-top-0' style='border-bottom: 1px solid #dee2e6 !important; display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; margin: 0px !important; padding-left: 1rem !important; padding-right: 1rem !important'> \
                <div class='col-4 px-0' style='margin: 0px !important; position: relative; width: 100%; padding-right: 15px; padding-left: 15px; -ms-flex: 0 0 33.333333%; flex: 0 0 33.333333%; max-width: 33.333333%; padding-right: 0px !important; padding-left: 0px !important'> \
                    <div><span> " + sessionExercise.exercise.name + " (" + sessionExercise.exercise.variant.name + ")</span></div>" +
                    (options.format.bHideExerciseDescription ? "" : "<div><small>(" + sessionExercise.exercise.description + ")</small></div>") +
                "</div> \
                <div class='col-8 px-0' style='margin: 0px !important; position: relative; width: 100%; padding-right: 15px; padding-left: 15px; -ms-flex: 0 0 66.666667%; flex: 0 0 66.666667%; max-width: 66.666667%; padding-right: 0px !important; padding-left: 0px !important'> \
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

    /**
     * Convert Series to HTML
     * @param series 
     * @param index 
     * @param options 
     */
    seriesReadViewToString(series: Series, index: number, options: any): string {
        let seriesToString = "";
        seriesToString = seriesToString +
            " \
            <div class='row m-0 d-flex' style='display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; margin: 0px !important; display: -ms-flexbox !important; display: flex !important;'> \
                <span>" + ((options.format.seriesFormat == 'seriesxrep') ? (series.seriesNumber + " × " + series.repNumber) : (series.repNumber + " × " + series.seriesNumber)) + " @ " + series.weight + series.measure + "</span> \
                <span class='ml-auto' style='margin-left: auto !important;'>" + series.rest + "s</span> \
            </div> \
            ";

        return seriesToString;
    }

    /* === End Convert Training to HTML string === */

    
    dateToString(date: Date): string {
        date = new Date(date);
        return (date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear());
    }

    copyObjectWithoutId(s1: any, s2: any) {
        for (const [key, value] of Object.entries(s2)) {
            if (key != '_id' && s1[key] !== undefined) {
                s1[key] = _.cloneDeep(s2[key])
            }
        }
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return DEVICE_TYPE.TABLET;
        }
        else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return DEVICE_TYPE.SMARTPHONE;
        }
        return DEVICE_TYPE.DESKTOP;
    };

    /* STYLE UTILS */
    blinkBtn(btnId: string) {
        $("#"+btnId).removeClass("whiteFlashBlink");
        $("#"+btnId).addClass("whiteFlashBlink");
        setTimeout(()=>{
          $("#"+btnId).removeClass("whiteFlashBlink");
        }, 1000)
    } 
    
}




