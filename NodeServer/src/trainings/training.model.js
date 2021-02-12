const mongoose = require('mongoose');

const SeriesSchema = mongoose.Schema({
    seriesNumber: Number,
    repNumber: Number,
    weight: Number,
    measure: String,
    rest: Number
}, { _id: false})

const SessionExerciseSchema = mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: false
    },
    series: [SeriesSchema]
}, { _id: false})

const SessionSchema = mongoose.Schema({
    name: String,
    comment: String,
    exercises: [SessionExerciseSchema]
}, { _id: false})

const WeekSchema = mongoose.Schema({
    comment: String,
    sessions: [SessionSchema]
}, { _id: false})

const TrainingSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    athletes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
    type: String,
    creationDate: Date,
    startDate: Date,
    endDate: Date,
    comment: String,
    weeks: [WeekSchema],
    oldVersions: [String]
}, {
    timestamps: true
});

const trainingSchema =  mongoose.model('Training', TrainingSchema);
module.exports = {Training: trainingSchema};
