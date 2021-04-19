import * as _ from 'lodash';

export class Contacts {
    email: string;
    telephone: string;

    constructor(email: string = "", telephone: string = "") {
        this.email = email;
        this.telephone = telephone;
    }
}


export class Residence {
    state: string;
    city: string;
    address: string;

    constructor(state: string = "Italy", city: string = "", address: string = "") {
        this.state = state;
        this.city = city;
        this.address = address;
    }
}

export class PRSeries {
    seriesNumber: number;
    repNumber: number;
    weight: number;
    measure: string;
    rest: number;
    bCompetition: boolean;
    bVerified: boolean;
    bPublic: boolean;
    comment: string;

    constructor(seriesNumber: number = 1, repNumber: number = 1, weight: number = 50, measure: string = "kg", rest: number = 90, bCompetition: boolean = false, bVerified: boolean = false, bPublic: boolean = false, comment: string = "") {
        this.seriesNumber = seriesNumber;
        this.repNumber = repNumber;
        this.weight = weight;
        this.measure = measure;
        this.rest = rest;
        this.bCompetition = bCompetition;
        this.bVerified = bVerified;
        this.bPublic = bPublic;
        this.comment = comment;
    }
}

export class PersonalRecord {
    exercise: Exercise;
    series: [PRSeries];
    oneRepPR: PRSeries;
    bPublic: boolean;

    constructor(exercise: Exercise = new Exercise(), series: [PRSeries] = [new PRSeries()], oneRepPR: PRSeries = new PRSeries(), bPublic: boolean = false) {
        this.exercise = exercise;
        this.series = series;
        this.oneRepPR = oneRepPR;
        this.bPublic = bPublic;
    }
}

// Note: for convention, a notification is uniquely identified using type_from, because cannot be two equals notifications with the same type and from fields!
export class Notification {
    _id: string;
    type: string;
    from: string;           // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
    destination: string;   // ONLY ID: Don't need to get the whole user, just need the id (it reduces the communication volume)
    message: string;
    bConsumed: boolean;
    creationDate: Date;

    constructor(_id: string = "", type: string = "", from: string = "", destination: string = "", message: string = "", bConsumed: boolean = false, creationDate: Date = new Date()) {
        this._id = _id;
        this.type = type;
        this.from = from;
        this.destination = destination;
        this.message = message;
        this.bConsumed = bConsumed;
        this.creationDate = creationDate;
    }
}

export class User {
    _id: string;
    name: string;
    surname: string;
    dateOfBirth: Date;
    sex: string;
    bodyWeight: number;
    userType: string;           // athlete, coach, both
    yearsOfExperience: number;
    contacts: Contacts;
    residence: Residence;
    personalRecords: PersonalRecord[];
    notifications: Notification[];
    coaches: string[];          // ONLY ID: Don't need to get the whole user, just need the id (ti reduces the communication volume)
    athletes: string[];         // ONLY ID: Don't need to get the whole user, just need the id (ti reduces the communication volume)
    biography: string;
    socials: any[];
    profilePicture: string;

    constructor(name: string = "", surname: string = "", dateOfBirth: Date = null, sex: string = "M", bodyWeight: number = 80,
                userType: string = "athlete", yearsOfExperience: number = 0, contacts: Contacts = new Contacts(), residence: Residence = new Residence(), 
                personalRecords: PersonalRecord[] = <PersonalRecord[]>[], notifications: Notification[] = <Notification[]>[], coaches: string[] = <string[]>[], 
                athletes: string[] = <string[]>[], biography: string = "", socials: [] = []) {
        this.name = name;
        this.surname = surname;
        this.dateOfBirth = dateOfBirth;
        this.sex = sex;
        this.bodyWeight = bodyWeight;
        this.userType = userType;
        this.yearsOfExperience = yearsOfExperience;
        this.contacts = contacts;
        this.residence = residence;
        this.personalRecords = personalRecords;
        this.notifications = notifications;
        this.coaches = coaches;
        this.athletes = athletes;
        this.biography = biography;
        this.socials = socials;
        this.profilePicture = this.profilePicture;
    }
}


export class Variant {
    name: string;
    intensityCoefficient: number;

    constructor(name: string = "Standard", intensityCoefficient: number = 1) {
        this.name = name;
        this.intensityCoefficient = intensityCoefficient;
    }
}


export class Series {
    seriesNumber: number;
    repNumber: number;
    weight: number;
    measure: string;
    rest: number;

    constructor(seriesNumber: number = 1, repNumber: number = 1, weight: number = 50, measure: string = "%", rest: number = 90) {
        this.seriesNumber = seriesNumber;
        this.repNumber = repNumber;
        this.weight = weight;
        this.measure = measure;
        this.rest = rest;
    }
}


export class Exercise {
    _id: string;
    name: string;
    variant: Variant;
    description: string;
    creator: string         // ONLY ID: Don't need to get the whole user, just need the id (ti reduces the communication volume)
    disciplines: string[];
    groups: string[];
    images: string[];

    constructor(name: string = "", variant: Variant = new Variant(), description: string = "", creator: string = "", disciplines: string[] = [], groups: string[] = [], images: string[] = []) {
        this.name = name;
        this.variant = variant;
        this.description = description;
        this.creator = creator;
        this.disciplines = disciplines;
        this.groups = groups;
        this.images = images;
    }
}

export class SessionExercise {
    exercise: Exercise;
    series: [Series];

    constructor(exercise: Exercise = new Exercise(), series: [Series] = [new Series()]){
        this.exercise = exercise;
        this.series = series;
    };
}

export class Session {
    name: string;
    comment: string;
    startDate: Date;
    endDate: Date;
    exercises: [SessionExercise];

    constructor(name: string = "", comment: string = "", startDate: Date = new Date(), endDate: Date = new Date(), exercises: [SessionExercise] = [new SessionExercise()] ) {
        this.name = name;
        this.comment = comment;
        this.startDate = startDate;
        this.endDate = endDate;
        this.exercises = exercises;
    }

    copyFromSession(session: Session) {
        this.name = session.name;
        this.comment = session.comment;
        this.startDate = session.startDate;
        this.endDate = session.endDate;
        this.exercises = _.cloneDeep(session.exercises);
    }
}


export class Week {
    comment: string;
    sessions: Session[];

    constructor(comment: string = "", sessions: Session[] = [new Session()]) {
        this.comment = comment;
        this.sessions = sessions;
    }
}


export class Training {
    _id: string;
    state: TRAINING_STATES;
    author: User;
    athletes: User[];
    type: string;
    creationDate: Date;
    updatedAt: Date;
    startDate: Date;
    endDate: Date;
    comment: string;
    weeks: [Week];
    oldVersions: string[];

    constructor(author: User = new User(), athletes: User[] = <User[]>[], state: TRAINING_STATES = TRAINING_STATES.NEW, type: string = TRAINING_TYPES.POWERLIFTING, creationDate: Date = new Date(), updatedAt: Date = new Date(),
                startDate: Date = new Date(), endDate: Date = new Date(), comment: string = "", weeks: [Week] = [new Week()], oldVersions: string[] = []) {
        this.state = state;
        this.author = author;
        this.athletes = athletes;
        this.type = type;
        this.creationDate = creationDate;
        this.updatedAt = updatedAt;
        this.startDate = startDate;
        this.endDate = endDate;
        this.comment = comment;
        this.weeks = weeks;
        this.oldVersions = oldVersions;
    }

    public trainingToString() {
    }
}

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