const express = require('express');
const router = express.Router();

const trainingService = require('src/trainings/training.service.js');
router.options('*') // enable pre-flight request for all requests

/* ROUTES */

// Create a new Training
router.post('/', trainingService.createTraining);

// Retrieve all Training
router.get('/', trainingService.findAllTraining);

// Retrieve all Training by user id
router.get('/user/:_id', trainingService.findAllTrainingByUserId);

// Retrieve a single Training with id
router.get('/:_id', trainingService.findOneTraining);

// Update a Training with id
router.put('/:_id', trainingService.updateTraining);

// Delete a Training with id
router.delete('/:_id', trainingService.deleteTraining);

module.exports = router;