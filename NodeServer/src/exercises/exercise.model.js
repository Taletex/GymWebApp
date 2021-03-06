const mongoose = require('mongoose');

const VariantSchema = mongoose.Schema({
    name: String,
    intensityCoefficient: Number
}, { _id: false})

const ExerciseSchema = mongoose.Schema({
    name: String,
    variant: VariantSchema,
    description: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    disciplines: [String],
    groups: [String],
    images: [String]
}, {
    timestamps: true
});

const exerciseSchema =  mongoose.model('Exercise', ExerciseSchema);
module.exports = {Exercise: exerciseSchema, ExerciseSchema: ExerciseSchema};