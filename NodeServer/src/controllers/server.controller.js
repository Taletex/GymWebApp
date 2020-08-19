const {Training, Exercise, User} = require('../models/server.model.js');
const appConfig = require('../../config.js')
const http = require('http');
const webAppBaseUrl = appConfig.webapp.address + "/";
const webAppTrainingUrl = webAppBaseUrl + "trainings/";
const rscPath = "../rsc";
var fs = require('fs');
var readline = require('readline');

/* TRAININGS FUNCTIONS */
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
        res.send(training[0]);
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


/* EXERCISES FUNCTIONS */
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
        series: req.body.series
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
        series: req.body.series
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

/* USERS FUNCTIONS */
// Create and Save a new User
exports.createUser = (req, res) => {
    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "User content can not be empty"
        });
    }
    
    // Create a User
    const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        dateOfBirth: req.body.dateOfBirth,
        sex: req.body.sex,
        userType: req.body.userType,
        yearsOfExperience: req.body.yearsOfExperience,
        contacts: req.body.contacts,
        residence: req.body.residence
    });

    // Save User in the database
    user.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
        });
    });
};

// Retrieve and return all users from the database.
exports.findAllUser = (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

// Find a single user with a id
exports.findOneUser = (req, res) => {
    User.find({_id: req.params._id})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });            
        }
        res.send(user[0]);
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

// Update a user identified by the id in the request
exports.updateUser = (req, res) => {
    // Validate Request
    if(!req.body) {
        return res.status(400).send({
            message: "User content can not be empty"
        });
    }

    // Find user and update it with the request body
    User.findOneAndUpdate({_id: req.params._id}, {
        name: req.body.name,
        surname: req.body.surname,
        dateOfBirth: req.body.dateOfBirth,
        sex: req.body.sex,
        userType: req.body.userType,
        yearsOfExperience: req.body.yearsOfExperience,
        contacts: req.body.contacts,
        residence: req.body.residence
    }, {new: true})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Error updating user with id " + req.params._id
        });
    });
};

// Delete a user with the specified id in the request
exports.deleteUser = (req, res) => {
    User.findOneAndRemove({_id: req.params._id})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });
        }
        res.send({message: "User deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });                
        }
        return res.status(500).send({
            message: "Could not delete user with id " + req.params._id
        });
    });
};