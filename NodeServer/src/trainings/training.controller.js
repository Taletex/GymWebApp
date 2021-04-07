const authorize = require('src/_middleware/authorize')

module.exports = function(io, clientSocketList) {
    
    const express = require('express');
    const router = express.Router();
    // router.options('*') // enable pre-flight request for all requests
    const trainingService = require('src/trainings/training.service.js')(io, clientSocketList);


    /* ROUTES */

    // Create a new Training
    router.post('/', authorize(), (req, res, next) => {trainingService.createTraining(req, res, next)});

    // Retrieve all Training
    router.get('/', authorize(), (req, res, next) => {trainingService.findAllTraining(req, res, next)});

    // Retrieve all Training by user id
    router.get('/user/:_id', authorize(), (req, res, next) => {trainingService.findAllTrainingByUserId(req, res, next)});

    // Retrieve a single Training with id
    router.get('/:_id', authorize(), (req, res, next) => {trainingService.findOneTraining(req, res, next)});
    
    // Update a Training with id
    router.put('/:_id', authorize(), (req, res, next) => {trainingService.updateTraining(req, res, next)});
    
    // Send notifications to all training athletes
    router.put('/:_id/notifications', authorize(), (req, res, next) => {trainingService.sendTrainingNotifications(req, res, next)});
 
    // Send email to all training athletes
    router.put('/:_id/emails', authorize(), (req, res, next) => {trainingService.sendTrainingEmails(req, res, next)});

    // Delete a Training with id
    router.delete('/:_id', authorize(), (req, res, next) => {trainingService.deleteTraining(req, res, next)});

    return router;

}

