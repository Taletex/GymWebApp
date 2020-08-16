const Training = require('../models/server.model.js');
const appConfig = require('../../config.js')
const http = require('http');
const webAppBaseUrl = appConfig.webapp.address + "/";
const webAppTrainingUrl = webAppBaseUrl + "trainings/";
const rscPath = "../rsc";
var fs = require('fs');
var readline = require('readline');


// Create and Save a new Training
exports.createTraining = (req, res) => {
    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "Training content can not be empty"
        });
    }
    
    // Create a Training
    const training = new Training({
        author: req.body.author,
        athlete: req.body.athlete,
        type: req.body.type,
        creationDate: req.body.creationDate,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        comment: req.body.comment,
        weeks: req.body.weeks
    });

    // Save Training in the database
    training.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Training."
        });
    });
};

// Retrieve and return all trainings from the database.
exports.findAllTraining = (req, res) => {
    Training.find()
    .then(trainings => {
        res.send(trainings);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving trainings."
        });
    });
};

// Find a single training with a id
exports.findOneTraining = (req, res) => {
    Training.find({_id: req.params._id})
    .then(training => {
        if(!training) {
            return res.status(404).send({
                message: "Training not found with id " + req.params._id
            });            
        }
        res.send(training);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Training not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Error retrieving training with id " + req.params._id
        });
    });
};

// Update a training identified by the id in the request
exports.updateTraining = (req, res) => {
    // Validate Request
    if(!req.body) {
        return res.status(400).send({
            message: "Training content can not be empty"
        });
    }

    // Find training and update it with the request body
    Training.findOneAndUpdate({_id: req.params._id}, {
        author: req.body.author,
        athlete: req.body.athlete,
        type: req.body.type,
        creationDate: req.body.creationDate,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        comment: req.body.comment,
        weeks: req.body.weeks
    }, {new: true})
    .then(training => {
        if(!training) {
            return res.status(404).send({
                message: "Training not found with id " + req.params._id
            });
        }
        res.send(training);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Training not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Error updating training with id " + req.params._id
        });
    });
};

// Delete a training with the specified id in the request
exports.deleteTraining = (req, res) => {
    Training.findOneAndRemove({_id: req.params._id})
    .then(training => {
        if(!training) {
            return res.status(404).send({
                message: "Training not found with id " + req.params._id
            });
        }
        res.send({message: "Training deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Training not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Could not delete training with id " + req.params._id
        });
    });
};