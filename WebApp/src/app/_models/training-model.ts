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

    constructor(name: string = "", surname: string = "", dateOfBirth: Date = null, sex: string = "M", bodyWeight: number = 80,
                userType: string = "athlete", yearsOfExperience: number = 0, contacts: Contacts = new Contacts(), residence: Residence = new Residence(), personalRecords: PersonalRecord[] = <PersonalRecord[]>[]) {
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

    constructor(name: string = "", variant: Variant = new Variant(), description: string = "") {
        this.name = name;
        this.variant = variant;
        this.description = description;
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
    exercises: [SessionExercise];

    constructor(name: string = "", comment: string = "", exercises: [SessionExercise] = [new SessionExercise()] ) {
        this.name = name;
        this.comment = comment;
        this.exercises = exercises;
    }
}


export class Week {
    comment: string;
    sessions: [Session];

    constructor(comment: string = "", sessions: [Session] = [new Session()]) {
        this.comment = comment;
        this.sessions = sessions;
    }
}


export class Training {
    _id: string;
    author: User;
    athlete: User;
    type: string;
    creationDate: Date;
    startDate: Date;
    endDate: Date;
    comment: string;
    weeks: [Week];

    constructor(author: User = new User(), athlete: User = new User(), type: string = "POWERLIFTING", creationDate: Date = new Date(), 
                startDate: Date = new Date(), endDate: Date = new Date(), comment: string = "", weeks: [Week] = [new Week()]) {
        this.author = author;
        this.athlete = athlete;
        this.type = type;
        this.creationDate = creationDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.comment = comment;
        this.weeks = weeks;
    }

    public trainingToString() {
        
    }
}




