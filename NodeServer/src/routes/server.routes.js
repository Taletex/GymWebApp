const cors = require('cors');
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 

module.exports = (app) => {
    const server = require('../controllers/server.controller.js');

    app.options('*', cors(corsOptions)) // enable pre-flight request for all requests
    
    // Create a new Training
    app.post('/trainings', cors(corsOptions), server.createTraining);

    // Retrieve all Training
    app.get('/trainings', cors(corsOptions), server.findAllTraining);

    // Retrieve a single Training with id
    app.get('/trainings/:id', cors(corsOptions), server.findOneTraining);
    
    // Update a Training with id
    app.put('/trainings/:id', cors(corsOptions), cors(corsOptions), server.updateTraining);

    // Delete a Training with id
    app.delete('/trainings/:id', cors(corsOptions), server.deleteTraining);
}