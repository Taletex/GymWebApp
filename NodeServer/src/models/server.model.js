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
    id: Number,
    name: String,
    surname: String,
    dateOfBirth: Date,
    sex: String,
    bodyWeight: Number,
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
    id: Number,
    name: String,
    variant: VariantSchema,
    description: String,
    series: [SeriesSchema]
})

const SessionSchema = mongoose.Schema({
    id: Number,
    name: String,
    comment: String,
    exercises: [ExerciseSchema]
}, { _id: false})

const WeekSchema = mongoose.Schema({
    id: Number,
    comment: String,
    sessions: [SessionSchema]
}, { _id: false})

const TrainingSchema = mongoose.Schema({
    id: Number,
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

module.exports = mongoose.model('Training', TrainingSchema);