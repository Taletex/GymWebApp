const cors = require('cors');
const express = require('express');
const router = express.Router();
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 


const exerciseService = require('src/exercises/exercise.service.js');
router.options('*', cors(corsOptions)) // enable pre-flight request for all requests

/* ROUTES */

// Create a new Exercise
router.post('/', cors(corsOptions), exerciseService.createExercise);

// Retrieve all Exercise
router.get('/', cors(corsOptions), exerciseService.findAllExercise);

// Retrieve a single Exercise with id
router.get('/:_id', cors(corsOptions), exerciseService.findOneExercise);

// Update a Exercise with id
router.put('/:_id', cors(corsOptions), cors(corsOptions), exerciseService.updateExercise);

// Delete a Exercise with id
router.delete('/:_id', cors(corsOptions), exerciseService.deleteExercise);

module.exports = router;