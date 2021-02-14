const cors = require('cors');
const express = require('express');
const router = express.Router();
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 


const exerciseService = require('src/exercises/exercise.service.js');

/* ROUTES */

// Create a new Exercise
router.post('/', exerciseService.createExercise);

// Retrieve all Exercise
router.get('/', exerciseService.findAllExercise);

// Retrieve all Exercise
router.get('/user/:_id', exerciseService.findAllExerciseForUser);

// Retrieve a single Exercise with id
router.get('/:_id', exerciseService.findOneExercise);

// Update a Exercise with id
router.put('/:_id', exerciseService.updateExercise);

// Delete a Exercise with id
router.delete('/:_id', exerciseService.deleteExercise);

module.exports = router;