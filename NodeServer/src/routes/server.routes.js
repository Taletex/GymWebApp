const cors = require('cors');
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 

module.exports = (app) => {
    const server = require('../controllers/server.controller.js');

    app.options('*', cors(corsOptions)) // enable pre-flight request for all requests
    
    /* TRAININGS ROUTING */
    // Create a new Training
    app.post('/trainings', cors(corsOptions), server.createTraining);

    // Retrieve all Training
    app.get('/trainings', cors(corsOptions), server.findAllTraining);

    // Retrieve a single Training with id
    app.get('/trainings/:_id', cors(corsOptions), server.findOneTraining);
    
    // Update a Training with id
    app.put('/trainings/:_id', cors(corsOptions), cors(corsOptions), server.updateTraining);

    // Delete a Training with id
    app.delete('/trainings/:_id', cors(corsOptions), server.deleteTraining);


    /* EXERCISES ROUTING */
    // Create a new Exercise
    app.post('/exercises', cors(corsOptions), server.createExercise);

    // Retrieve all Exercise
    app.get('/exercises', cors(corsOptions), server.findAllExercise);

    // Retrieve a single Exercise with id
    app.get('/exercises/:_id', cors(corsOptions), server.findOneExercise);
    
    // Update a Exercise with id
    app.put('/exercises/:_id', cors(corsOptions), cors(corsOptions), server.updateExercise);

    // Delete a Exercise with id
    app.delete('/exercises/:_id', cors(corsOptions), server.deleteExercise);
}