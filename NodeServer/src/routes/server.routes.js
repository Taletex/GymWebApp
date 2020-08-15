const cors = require('cors');
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 

module.exports = (app) => {
    const server = require('../controllers/server.controller.js');

    app.options('*', cors(corsOptions)) // enable pre-flight request for all requests
    
    // Create a new Training
    app.post('/trainings', cors(corsOptions), function(req,res){
        server.createTraining
    });

    // Retrieve all Training
    app.get('/trainings', cors(corsOptions), function(req,res){
        server.findAllTraining
    });

    // Retrieve a single Training with id
    app.get('/trainings/:id', cors(corsOptions), function(req,res){
        server.findOneTraining
    });
    
    // Update a Training with id
    app.put('/trainings/:id', cors(corsOptions), cors(corsOptions), function(req,res){
        server.updateTraining
    });

    // Upload a training with id
    app.get('/upload/:id', cors(corsOptions), function(req,res){
        server.uploadTraining
    });

    // Delete a Training with id
    app.delete('/trainings/:id', cors(corsOptions), function(req,res){
        server.deleteTraining
    });
}