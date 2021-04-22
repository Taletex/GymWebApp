const cors = require('cors');
const authorize = require('src/_middleware/authorize')
const express = require('express');
const router = express.Router();
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 


const exerciseService = require('src/exercises/exercise.service.js')();

/* ROUTES */

// Create a new Exercise
router.post('/', authorize(), exerciseService.createExercise);

// Retrieve all Exercise
router.get('/', authorize(), exerciseService.findAllExercise);

// Retrieve all Exercise
router.get('/user/:_id', authorize(), exerciseService.findAllExerciseForUser);

// Retrieve a single Exercise with id
router.get('/:_id', authorize(), exerciseService.findOneExercise);

// Update a Exercise with id
router.put('/:_id', authorize(), exerciseService.updateExercise);

// Delete a Exercise with id
router.delete('/:_id', authorize(), exerciseService.deleteExercise);

module.exports = router;