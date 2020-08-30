const mongoose = require('mongoose');
const {ExerciseSchema} = require('src/exercises/exercise.model.js');
const {UserSchema} = require('src/users/user.model.js');

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
module.exports = {Training: trainingSchema};
