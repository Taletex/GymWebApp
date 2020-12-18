const {User} = require('src/users/user.model.js');
const _ = require('lodash');


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
        bodyWeight: req.body.bodyWeight,
        userType: req.body.userType,
        yearsOfExperience: req.body.yearsOfExperience,
        name: req.body.name,
        surname: req.body.surname,
        dateOfBirth: req.body.dateOfBirth,
        sex: req.body.sex,
        contacts: req.body.contacts,
        residence: req.body.residence,
        personalRecords: []
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
    User.find().populate({ path: 'personalRecords', populate: { path: 'exercise'} })
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

// Retrieve and return all users from the database.
exports.findAllAthlete = (req, res) => {
    User.find().populate({ path: 'personalRecords', populate: { path: 'exercise'} })
    .then(users => {
        res.send(_.filter(users, function(user) { return (user.userType == "athlete" || user.userType == "both"); }));
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

// Retrieve and return all users from the database.
exports.findAllCoaches = (req, res) => {
    User.find().populate({ path: 'personalRecords', populate: { path: 'exercise'} })
    .then(users => {
        res.send(_.filter(users, function(user) { return (user.userType == "coach" || user.userType == "both"); }));
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

// Find a single user with a id
exports.findOneUser = (req, res) => {
    User.find({_id: req.params._id}).populate({ path: 'personalRecords', populate: { path: 'exercise'} })
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
        bodyWeight: req.body.bodyWeight,
        userType: req.body.userType,
        yearsOfExperience: req.body.yearsOfExperience,
        name: req.body.name,
        surname: req.body.surname,
        dateOfBirth: req.body.dateOfBirth,
        sex: req.body.sex,
        contacts: req.body.contacts,
        residence: req.body.residence,
        personalRecords: req.body.personalRecords
    }, {new: true})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params._id
            });
        }

        // Returns the user update by finding it in the database
        User.find({_id: user._id}).populate({ path: 'personalRecords', populate: { path: 'exercise'} })
        .then(users => {
            res.send(users[0]);
        })
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