const cors = require('cors');
const express = require('express');
const router = express.Router();
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 


const trainingService = require('src/trainings/training.service.js');
router.options('*', cors(corsOptions)) // enable pre-flight request for all requests

/* ROUTES */

// Create a new Training
router.post('/', cors(corsOptions), trainingService.createTraining);

// Retrieve all Training
router.get('/', cors(corsOptions), trainingService.findAllTraining);

// Retrieve a single Training with id
router.get('/:_id', cors(corsOptions), trainingService.findOneTraining);

// Update a Training with id
router.put('/:_id', cors(corsOptions), cors(corsOptions), trainingService.updateTraining);

// Delete a Training with id
router.delete('/:_id', cors(corsOptions), trainingService.deleteTraining);

module.exports = router;