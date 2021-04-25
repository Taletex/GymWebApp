import { ca } from 'date-fns/locale';
import * as _ from 'lodash';


/* === CLASSES === */
export class Socials {
    constructor(
        public facebook: string = "", 
        public twitter: string = "", 
        public instagram: string = "", 
        public linkedin: string = "", 
        public other: string = ""
    ) {}
}

export class Contacts {
    constructor(
        public email: string = "", 
        public telephone: string = "", 
        public socials: Socials = new Socials()
    ) {}
}


export class Residence {
    constructor(
        public state: string = "Italy", 
        public province: string = "", 
        public cap: string = "", 
        public city: string = "", 
        public address: string = ""
    ) {}
}


export class UserOptions {
    constructor(
        public bShowActivities: OPTION_VISIBILITY = OPTION_VISIBILITY.ALL,
        public bShowPrivateInfo: OPTION_VISIBILITY = OPTION_VISIBILITY.ALL, 
        public bShowPublicInfo: OPTION_VISIBILITY = OPTION_VISIBILITY.ALL
    ) {}
}


export class PRSeries {
    constructor(
        public seriesNumber: number = 1, 
        public repNumber: number = 1, 
        public weight: number = 50, 
        public measure: string = "kg", 
        public rest: number = 90, 
        public bCompetition: boolean = false, 
        public bVerified: boolean = false, 
        public bPublic: boolean = false, 
        public comment: string = ""
    ) {}
}

export class PersonalRecord {
    constructor(
        public exercise: Exercise = new Exercise(), 
        public series: [PRSeries] = [new PRSeries()], 
        public oneRepPR: PRSeries = new PRSeries(), 
        public bPublic: boolean = false
    ) {}
}

export class Notification {
    constructor(
        public _id: string = "", 
        public type: string = "", 
        public from: string = "",            // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
        public destination: string = "",     // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
        public message: string = "", 
        public bConsumed: boolean = false, 
        public creationDate: Date = new Date()
    ) {}
}

export class Federation {
    constructor(
        public _id: string = "", 
        public name: string = "", 
        public description: string = "", 
        public website: string = "", 
        public state: string = "", 
        public founded: Date = new Date(), 
        public logo: string = ""
    ) {}
}

export class Activity {
    constructor(
        public _id: string = "", 
        public type: string = "", 
        public name: string = "", 
        public disciplines: string[] = [], 
        public federation: Federation = new Federation(), 
        public grade: string = "", 
        public ageCategories: string[] = [], 
        public weightCategories: string[]= [],
        public place: Residence = new Residence(), 
        public startDate: Date = new Date(), 
        public endDate: Date = new Date(), 
        public description: string = "", 
        public guests: string[] = [],                   // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
        public costs: string[] = [], 
        public prices: string[] = [], 
        public patreons: string[] = [],
        public creator: string = "",                    // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
        public bPublic: boolean = true
    ) {}
}

export class User {
    public _id: string;

    constructor(
        public name: string = "", 
        public surname: string = "", 
        public dateOfBirth: Date = null, 
        public placeOfBirth: Residence = new Residence(), 
        public sex: string = "M",      
        public userType: string = "athlete", 
        public bodyWeight: number = 80, 
        public yearsOfExperience: number = 0, 
        public disciplines: string[] = [], 
        public gyms: string[] = [], 
        public coaches: string[] = <string[]>[],                            // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
        public athletes: string[] = <string[]>[],                           // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
        public personalRecords: PersonalRecord[] = <PersonalRecord[]>[],    
        public contacts: Contacts = new Contacts(), 
        public residence: Residence = new Residence(), 
        public biography: string = "", 
        public profilePicture: string = "",
        public notifications: Notification[] = <Notification[]>[], 
        public options: UserOptions = new UserOptions()
    ) {}
}


export class Variant {
    constructor(
        public name: string = "Standard", 
        public intensityCoefficient: number = 1
    ) {}
}


export class Series {
    constructor(
        public seriesNumber: number = 1, 
        public repNumber: number = 1, 
        public weight: number = 50, 
        public measure: string = "%", 
        public rest: number = 90
    ) {}
}


export class Exercise {
    _id: string;

    constructor(
        public name: string = "", 
        public variant: Variant = new Variant(), 
        public description: string = "", 
        public creator: string = "",                // ONLY ID: Don't need to get the whole user, just need the id (ti reduces the communication volume)
        public disciplines: string[] = [], 
        public groups: string[] = [], 
        public images: string[] = []
    ) {}
}

export class SessionExercise {
    constructor(
        public exercise: Exercise = new Exercise(), 
        public series: [Series] = [new Series()]
    ){}
}

export class Session {

    constructor(
        public name: string = "", 
        public comment: string = "", 
        public startDate: Date = new Date(), 
        public endDate: Date = new Date(), 
        public exercises: [SessionExercise] = [new SessionExercise()] 
    ) {}

    copyFromSession(session: Session) {
        this.name = session.name;
        this.comment = session.comment;
        this.startDate = session.startDate;
        this.endDate = session.endDate;
        this.exercises = _.cloneDeep(session.exercises);
    }
}


export class Week {
    constructor(
        public comment: string = "", 
        public sessions: Session[] = [new Session()]
    ) {}
}


export class Training {
    _id: string;

    constructor(
        public author: User = new User(), 
        public athletes: User[] = <User[]>[], 
        public state: TRAINING_STATES = TRAINING_STATES.NEW, 
        public type: string = TRAINING_TYPES.POWERLIFTING, 
        public creationDate: Date = new Date(), 
        public updatedAt: Date = new Date(),
        public startDate: Date = new Date(),
        public endDate: Date = new Date(), 
        public comment: string = "", 
        public weeks: [Week] = [new Week()], 
        public oldVersions: string[] = []
    ) {}
}


/* === ENUMS === */
export enum TRAINING_STATES {
    NEW = "nuovo",
    STARTED = "in corso",
    COMPLETED = "completato",
    PARTIAL_COMPLETED = "completato parzialmente",
    ABORTED = "cancellato"
}

export enum TRAINING_TYPES {
    POWERLIFTING = "powerlifting",
    WEIGHTLIFTING = "weightlifting",
    CROSSFIT = "crossfit",
    BODYBUILDING = "bodybuilding",
    SALA = "sala attrezzi",
    CUSTOM = "custom"
}

export enum EXERCISE_GROUPS {
    ARMS = "braccia",
    LEGS = "gambe",
    CORE = "addome",
    BICEPS = "bicipiti",
    TRICEPS = "tricipiti",
    QUADRICEPS = "quadricipiti",
    ARMISTRINGS = "bicipiti femorali",
    NECK = "collo",
    HEAD = "testa",
    CALVES = "polpacci"
}

export enum OPTION_VISIBILITY {
    ALL = 0,
    LINKS_ONLY = 1,
    NONE = 2
}