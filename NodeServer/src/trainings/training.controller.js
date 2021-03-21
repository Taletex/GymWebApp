module.exports = function(io, clientSocketList) {
    
    const express = require('express');
    const router = express.Router();
    // router.options('*') // enable pre-flight request for all requests
    const trainingService = require('src/trainings/training.service.js')(io, clientSocketList);


    /* ROUTES */

    // Create a new Training
    router.post('/', (req, res, next) => {trainingService.createTraining(req, res, next)});

    // Retrieve all Training
    router.get('/', (req, res, next) => {trainingService.findAllTraining(req, res, next)});

    // Retrieve all Training by user id
    router.get('/user/:_id', (req, res, next) => {trainingService.findAllTrainingByUserId(req, res, next)});

    // Retrieve a single Training with id
    router.get('/:_id', (req, res, next) => {trainingService.findOneTraining(req, res, next)});
    
    // Update a Training with id
    router.put('/:_id', (req, res, next) => {trainingService.updateTraining(req, res, next)});

    // Delete a Training with id
    router.delete('/:_id', (req, res, next) => {trainingService.deleteTraining(req, res, next)});

    return router;

}

