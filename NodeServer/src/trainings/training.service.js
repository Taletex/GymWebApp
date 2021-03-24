const {Training} = require('src/trainings/training.model.js');
const {User, UserSchema} = require('src/users/user.model.js')
const {NOTIFICATION_TYPE} = require('src/_helpers/enum.js');
const _ = require('lodash');
const { Notification } = require('../users/user.model');
const { forEach } = require('lodash');

/** REST CALLBACKS **/
module.exports = (io, clientSocketList) => {

    const notificationService = require('src/_helpers/notification.service')(io, clientSocketList);

    return {
        createTraining,
        findAllTraining,
        findAllTrainingByUserId,
        findOneTraining,
        updateTraining,
        deleteTraining,
        sendTrainingNotifications
    };


    // Replaces user and exercise entities with their ids 
    function trainingDecorator(t) {
        let training = _.cloneDeep(t);
        
        if(training.author._id != undefined && training.author._id != null && training.author._id != "") 
            training.author = training.author._id;
        if(training.athletes != null && training.athletes.length > 0) {
            for(let i=0; i<training.athletes.length; i++) {
                if(training.athletes[i]._id != undefined && training.athletes[i]._id != null && training.athletes[i]._id != "") 
                training.athletes[i] = training.athletes[i]._id;
            }
        }

        for(let i=0; i<training.weeks.length; i++) {
            for(let j=0; j<training.weeks[i].sessions.length; j++) {
                for(let k=0; k<training.weeks[i].sessions[j].exercises.length; k++) {
                    if(training.weeks[i].sessions[j].exercises[k].exercise._id != undefined && training.weeks[i].sessions[j].exercises[k].exercise._id != null)
                        training.weeks[i].sessions[j].exercises[k].exercise = training.weeks[i].sessions[j].exercises[k].exercise._id;
                    else 
                        if((training.weeks[i].sessions[j].exercises[k].exercise == undefined || training.weeks[i].sessions[j].exercises[k].exercise == null || training.weeks[i].sessions[j].exercises[k].exercise == "") || 
                            (training.weeks[i].sessions[j].exercises[k].exercise.name != undefined && training.weeks[i].sessions[j].exercises[k].exercise.name != null && training.weeks[i].sessions[j].exercises[k].exercise.name == ""))
                            training.weeks[i].sessions[j].exercises.splice(k, 1);
                }

                if(training.weeks[i].sessions[j].exercises.length == 0)
                    training.weeks[i].sessions[j].exercises = []; 
            }
        }

        return training;
    };

    // Create and Save a new Training
    function createTraining(req, res, next) {
        // Validate request
        if(!req.body) {
            return res.status(400).send({
                message: "Training content can not be empty"
            });
        }
        
        // Create a Training
        const training = new Training(trainingDecorator({
            author: req.body.author,
            athletes: req.body.athletes,
            type: req.body.type,
            creationDate: req.body.creationDate,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            comment: req.body.comment,
            weeks: req.body.weeks, 
            oldVersions: req.body.oldVersions
        }));

        // Save Training in the database
        training.save()
        .then(data => {

            // 1. Find athletes and the new training
            Promise.all([
                User.find({_id: {$in: req.body.athletes}}), 
                Training.findOne({_id: training._id}).populate('author').populate('athletes').populate({ path: 'weeks', populate: { path: 'sessions', populate: { path: 'exercises', populate: { path: 'exercise' }} }})
            ])
            .then(([users, training]) => {
                
                // 2. Send notifications to all athletes client (if online)
                let message = "Il coach " + training.author.name + " " + training.author.surname + " ha creato un nuovo <a href='trainings/" + training._id + "'>allenamento</a>.";
                const userPromise = users.map(user => {
                    return new Promise((resolve, reject) => {
                        user.notifications.push(new Notification({ type: NOTIFICATION_TYPE.TRAINING_CREATED, from: req.body.author, destination: user._id, message: message, bConsumed: false, creationDate: new Date() }));
                        user.save((error, result) => {
                            if (error)
                              reject(error)

                            result.populate({path: 'personalRecords', populate: {path: 'exercise'}})
                            .populate({path: 'notifications', populate: {path: 'destination'}})
                            .populate({path: 'notifications', populate: {path: 'from'}})
                            .populate('coaches').populate('athletes').execPopulate().then((result) => {
                                resolve(result);
                            })
                          })
                    })
                })
                Promise.all(userPromise).then((users) => {

                    // 3. Update all client informations using the socket
                    for(let i=0; i<users.length; i++) 
                        notificationService.sendUpdatedUserToItsSocket(users[i]);

                    // 4. Return the new training
                    res.send(training);
                })

            })
            
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Training."
            });
        });
    };


    // Retrieve and return all trainings from the database
    function findAllTraining(req, res, next) {
        Training.find({}).populate('author').populate('athletes').populate({ path: 'weeks', populate: { path: 'sessions', populate: { path: 'exercises', populate: { path: 'exercise' }} }})
        .then(trainings => {
            res.send( _.sortBy(trainings, ['creationDate', 'author.name', 'author.surname']) );
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving trainings."
            });
        });
    };

    /**
     * Retrieve and return all trainings related to an user (by user id) from the database. 
     * If the user is a coach it retrieves all the trainings where the user is the creator. If the user is an athlete it retrieves all the trainings where the user is the receiver
     */
    function findAllTrainingByUserId(req, res, next) {
        User.find({_id: req.params._id}).then(data => {

            let trainingList = [];
            let user = data[0];

            Training.find().populate('author').populate('athletes').populate({ path: 'weeks', populate: { path: 'sessions', populate: { path: 'exercises', populate: { path: 'exercise' }} }})
            .then(trainings => {
                switch(user.userType) {
                    case 'athlete':
                        trainingList = _.filter(trainings, function(t) { return (_.find(t.athletes, function(athlete) { return athlete._id.toString() == user._id.toString() }) != undefined); });
                        break;
                    case 'coach':
                        trainingList = _.filter(trainings, function(t) { return t.toObject().author._id.toString() == user._id.toString(); });
                        break;
                    case 'both':
                        trainingList = _.filter(trainings, function(t) { return t.toObject().author._id.toString() == user._id.toString() || (_.find(t.athletes, function(athlete) { return athlete._id.toString() == user._id.toString() }) != undefined); });
                        break;
                    default:
                        trainingList = [];
                        break;
                }
                res.send(  _.sortBy(trainingList, ['creationDate', 'author.name', 'author.surname']) );
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving trainings."
                });
            });

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

    // Find a single training with a id
    function findOneTraining (req, res, next) {
        Training.find({_id: req.params._id}).populate('author').populate('athletes').populate({ path: 'weeks', populate: { path: 'sessions', populate: { path: 'exercises', populate: { path: 'exercise' }} }})
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
    function updateTraining (req, res, next) {
        // Validate Request
        if(!req.body) {
            return res.status(400).send({
                message: "Training content can not be empty"
            });
        }


        // Find training and update it with the request body
        Training.findOneAndUpdate({_id: req.params._id}, trainingDecorator({
            author: req.body.author,
            athletes: req.body.athletes,
            type: req.body.type,
            creationDate: req.body.creationDate,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            comment: req.body.comment,
            weeks: req.body.weeks,
            oldVersions: req.body.oldVersions
        }), {new: true})
        .then(training => {
            if(!training) {
                return res.status(404).send({
                    message: "Training not found with id " + req.params._id
                });
            }

            // Returns the training updated by finding it in the database
            Training.find({_id: req.params._id}).populate('author').populate('athletes').populate({ path: 'weeks', populate: { path: 'sessions', populate: { path: 'exercises', populate: { path: 'exercise' }} }})
            .then(data => {
                res.send(data[0]);
            })
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
    function deleteTraining (req, res, next) {
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

    function sendTrainingNotifications(req, res, next) {
        
        // 1. Find athletes and the new training
        Promise.all([
            User.find({_id: {$in: req.body.athletes}}), 
            Training.findOne({_id: req.params._id}).populate('author').populate('athletes').populate({ path: 'weeks', populate: { path: 'sessions', populate: { path: 'exercises', populate: { path: 'exercise' }} }})
        ])
        .then(([users, training]) => {
            
            // 2. Send notifications to all athletes client (if online)
            const userPromise = users.map(user => {
                return new Promise((resolve, reject) => {
                    user.notifications.push(new Notification({ type: req.body.notification.type, from: req.body.notification.from, destination: user._id, message: req.body.notification.message, bConsumed: req.body.notification.bConsumed, creationDate: req.body.notification.creationDate }));
                    user.save((error, result) => {
                        if (error)
                          reject(error)

                        result.populate({path: 'personalRecords', populate: {path: 'exercise'}})
                        .populate({path: 'notifications', populate: {path: 'destination'}})
                        .populate({path: 'notifications', populate: {path: 'from'}})
                        .populate('coaches').populate('athletes').execPopulate().then((result) => {
                            resolve(result);
                        })
                      })
                })
            })
            Promise.all(userPromise).then((users) => {

                // 3. Update all client informations using the socket
                for(let i=0; i<users.length; i++) 
                    notificationService.sendUpdatedUserToItsSocket(users[i]);

                // 4. Return the new training
                res.send(training);
            })

        })
    }
}

