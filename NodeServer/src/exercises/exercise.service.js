const {Exercise} = require('src/exercises/exercise.model.js');
const {User} = require('src/users/user.model.js')
const _ = require('lodash');


// Create and Save a new Exercise
exports.createExercise = (req, res) => {
    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "Exercise content can not be empty"
        });
    }
    
    // Create a Exercise
    const exercise = new Exercise({
        name: req.body.name,
        variant: req.body.variant,
        description: req.body.description,
        creator: (req.body.creator != "") ? req.body.creator : null
    });

    // Save Exercise in the database
    exercise.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Exercise."
        });
    });
};

// Retrieve and return all exercises from the database.
exports.findAllExercise = (req, res) => {
    Exercise.find()
    .then(exercises => {
        res.send(exercises);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving exercises."
        });
    });
};

/**
 * Retrieve and return all exercises for a given user from the database.
 * If the user is a coach, this function returns all default exercises plus all exercises the coach has created.
 * If the user is an athlete, this function returns all default exericses plus all the exercises created by his coaches. 
 * */ 
exports.findAllExerciseForUser = (req, res) => {

    User.find({_id: req.params._id}).then(users => {
        if(!users) {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });            
        }
        
        switch(users[0].userType) {
            case 'coach': {
                Exercise.find({ $or: [{creator: null}, {creator: users[0]._id}] })
                .then(exercises => {
                    res.send(exercises);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving exercises."
                    });
                });
                break;
            }
    
            case 'athlete': {
                let coachesIds = _.map(users[0].coaches, function(coach) { return coach._id; });
                Exercise.find({ $or: [{creator: null}, {creator: coachesIds}] })
                .then(exercises => {
                    res.send(exercises);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving exercises."
                    });
                });
                break;
            }
    
            case 'both': {
                let coachesIds = _.map(users[0].coaches, function(coach) { return coach._id; });
                Exercise.find({ $or: [{creator: null}, {creator: users[0]._id}, {creator: coachesIds}] })
                .then(exercises => {
                    res.send(exercises);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving exercises."
                    });
                });
                break;
            }
        }

    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Error retrieving user with id " + req.params._id
        });
    });
};

// Find a single exercise with a id
exports.findOneExercise = (req, res) => {
    Exercise.find({_id: req.params._id})
    .then(exercise => {
        if(!exercise) {
            return res.status(404).send({
                message: "Exercise not found with id " + req.params._id
            });            
        }
        res.send(exercise[0]);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Exercise not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Error retrieving exercise with id " + req.params._id
        });
    });
};

// Update a exercise identified by the id in the request
exports.updateExercise = (req, res) => {
    // Validate Request
    if(!req.body) {
        return res.status(400).send({
            message: "Exercise content can not be empty"
        });
    }

    // Find exercise and update it with the request body
    Exercise.findOneAndUpdate({_id: req.params._id}, {
        name: req.body.name,
        variant: req.body.variant,
        description: req.body.description,
        creator: (req.body.creator != "") ? req.body.creator : null
    }, {new: true})
    .then(exercise => {
        if(!exercise) {
            return res.status(404).send({
                message: "Exercise not found with id " + req.params._id
            });
        }
        res.send(exercise);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Exercise not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Error updating exercise with id " + req.params._id
        });
    });
};

// Delete a exercise with the specified id in the request
exports.deleteExercise = (req, res) => {
    Exercise.findOneAndRemove({_id: req.params._id})
    .then(exercise => {
        if(!exercise) {
            return res.status(404).send({
                message: "Exercise not found with id " + req.params._id
            });
        }
        res.send({message: "Exercise deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Exercise not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Could not delete exercise with id " + req.params._id
        });
    });
};