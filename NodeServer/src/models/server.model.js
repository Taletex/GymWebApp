const mongoose = require('mongoose');

const ContactsSchema = mongoose.Schema({
    email: String,
    telephone: String
}, { _id: false})

const ResidenceSchema = mongoose.Schema({
    state: String,
    city: String
}, { _id: false})

const UserSchema = mongoose.Schema({
    name: String,
    surname: String,
    dateOfBirth: Date,
    sex: String,
    userType: String,
    yearsOfExperience: Number,
    contacts: ContactsSchema,
    residence: ResidenceSchema
}, {
    timestamps: true
});

const VariantSchema = mongoose.Schema({
    name: String,
    intensityCoefficient: Number
}, { _id: false})

const SeriesSchema = mongoose.Schema({
    seriesNumber: Number,
    repNumber: Number,
    weight: Number,
    measure: String,
    rest: Number
}, { _id: false})

const ExerciseSchema = mongoose.Schema({
    name: String,
    variant: VariantSchema,
    description: String,
    series: [SeriesSchema]
}, {
    timestamps: true
});

const SessionSchema = mongoose.Schema({
    name: String,
    comment: String,
    exercises: [ExerciseSchema]
}, { _id: false})

const WeekSchema = mongoose.Schema({
    comment: String,
    sessions: [SessionSchema]
}, { _id: false})

const TrainingSchema = mongoose.Schema({
    author: UserSchema,
    athlete: UserSchema,
    type: String,
    creationDate: Date,
    startDate: Date,
    endDate: Date,
    comment: String,
    weeks: [WeekSchema]
}, {
    timestamps: true
});

const trainingSchema =  mongoose.model('Training', TrainingSchema);
const exerciseSchema =  mongoose.model('Exercise', ExerciseSchema);
const userSchema =  mongoose.model('User', UserSchema);
module.exports = {Training: trainingSchema, Exercise: exerciseSchema, User: userSchema};
