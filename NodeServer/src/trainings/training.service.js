const {Training} = require('src/trainings/training.model.js');
const {User} = require('src/users/user.model.js')
const {Notification} = require('../users/user.model');
const {NOTIFICATION_TYPE} = require('src/_helpers/enum.js');
const _ = require('lodash');
const emailHelper = require('src/_helpers/send-email');
var html_to_pdf = require('html-pdf-node');
const fs = require('fs');
const moment = require('moment');

/** REST CALLBACKS **/
module.exports = (io, clientSocketList) => {

    const notificationService = require('src/_helpers/notification.service')(io, clientSocketList);
    const TRAINING_VALIDATIONS = {MAX_SESSION_NAME_LENGTH: 50, MAX_SESSION_COMMENT_LENGTH: 100, MAX_SERIES_NUMBER: 99999, MIN_SERIES_NUMBER: 1, MAX_REP_NUMBER: 99999, MIN_REP_NUMBER: 1, 
                                  MAX_WEIGHT_NUMBER: 99999, MIN_WEIGHT_NUMBER: 0, MAX_REST_TIME: 99999, MIN_REST_TIME: 0, MAX_DATE: "2100-01-01T00:00", MAX_WEEK_COMMENT_LENGTH: 500, MAX_TRAINING_COMMENT_LENGTH: 1000, MIN_TYPE_LENGTH: 1, MAX_TYPE_LENGTH: 50};

    return {
        createTraining,
        findAllTraining,
        findAllTrainingByUserId,
        findOneTraining,
        updateTraining,
        deleteTraining,
        sendTrainingNotifications,
        sendTrainingEmails
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
    async function createTraining(req, res, next) {
        // Validate request
        if(!req.body) {
            return res.status(400).send({
                message: "Training content can not be empty"
            });
        }
        
        // Create a Training
        const training = new Training(trainingDecorator({
            state: req.body.state,
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

        if(areBasicTrainingInfosValidToSubmit(training)) {
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
        } else {
            res.status(500).send({
                message: "Training contains invalid field values."
            });
        }
    };


    // Retrieve and return all trainings from the database
    async function findAllTraining(req, res, next) {
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

        if(isTrainingValidToSubmit(new Training({state: req.body.state,
            author: req.body.author,
            athletes: req.body.athletes,
            type: req.body.type,
            creationDate: req.body.creationDate,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            comment: req.body.comment,
            weeks: req.body.weeks,
            oldVersions: req.body.oldVersions}))
            ) {
            // Find training and update it with the request body
            Training.findOneAndUpdate({_id: req.params._id}, trainingDecorator({
                state: req.body.state,
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
        } else {
            res.status(500).send({
                message: "Training contains invalid field values."
            });
        }
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
            User.find({_id: {$in: req.body.athletes}})
        ])
        .then(([users]) => {
            
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

                // 4. Return success string
                res.status(200).send(users);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while send training notifications."
                });
            });

        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while send training notifications."
            });
        });
    }

    /**
     * Send email to all athlete of a training telling them that the training has been modified by the author.
     * TODO: send pdf training as attachment to the email
     */
    async function sendTrainingEmails(req, res, next) {

        if(req.body != null && req.body.author != null && req.body.athletes != null) {

            // 1. Check if athletes emails are valid
            let athletes = _.filter(req.body.athletes, function(a) { return (a.contacts.email != null && emailHelper.validateEmail(a.contacts.email)) });
            
            if(athletes.length > 0) {

                // 2. Prepare Training as PDF
                let dirPath = "./files"
                let filePath = dirPath + "/" + req.params._id + ".pdf";
                if (!fs.existsSync(dirPath))
                    fs.mkdirSync(dirPath);
                await createTrainingAsPDF(req.body.trainingAsHTML, filePath);

                // 3. Send emails to destination users
                const emailPromise = athletes.map(athlete => {
                    return new Promise((resolve, reject) => {
                        emailHelper.sendEmail({
                            to: athlete.contacts.email,
                            subject: 'MyTrainingPlatform - Aggiornamento Allenamento',
                            attachments: [{   
                                path: filePath,
                            }],
                            html: `<h4>Allenamento ${req.params._id} Aggiornato!</h4>
                                <p>Il tuo coach ${req.body.author.name} ${req.body.author.surname} ha aggiornato l'allenamento </p><a href="http://www.mytrainingplatform.it/trainings/${req.params._id}">${req.params._id}!</a>` // use http://localhost for development
                        }).then((data) => { resolve(data); }).catch((err) => reject(err));
                    })
                })
                Promise.all(emailPromise).then((results) => {
        
                    // 4. Send response to client
                    res.status(200).send({message: "Email correttamente inviate agli utenti", successAthletes: athletes});
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while sending the Training emails."
                    });
                });

            } else
                res.status(500).send({message: "Send Training Email list is empty."});
        } else 
            res.status(500).send({message: "Send Training Email body request is empty."});
    }


    /* UTILS */
    async function createTrainingAsPDF(trainingAsHTML, filePath) {
        let options = { format: 'A4', printBackground: true };
        let file = { content: trainingAsHTML, name: 'example.pdf' };

        return new Promise((resolve, reject) => {

            html_to_pdf.generatePdf(file, options).then((buffer) => {
                fs.appendFileSync(filePath, new Buffer.from(buffer));   // Save training in files folder
                resolve(buffer);
            }).catch((err) => {
                reject(err | "Error during pdf creation");
            });;
        });
    }

    /* === VALIDATION FUNCTIONS === */
    function isValidStartDate(startDate) {
        return !(moment(startDate).isAfter(TRAINING_VALIDATIONS.MAX_DATE));
    }
    function isValidEndDate(startDate, endDate) {
        return !(moment(endDate).isBefore(startDate) || moment(endDate).isAfter(TRAINING_VALIDATIONS.MAX_DATE));
    }

    function isSessionValidToSubmit(session) {

        // session name and comment lengths must be less than their limits
        if(session.name.length > TRAINING_VALIDATIONS.MAX_SESSION_NAME_LENGTH || session.comment.length > TRAINING_VALIDATIONS.MAX_SESSION_COMMENT_LENGTH)
            return false;

        // end date must be after start date, end date and start date must be before 2100-01-01
        if(moment(session.endDate).isBefore(session.startDate) || moment(session.endDate).isAfter(TRAINING_VALIDATIONS.MAX_DATE) || moment(session.startDate).isAfter(TRAINING_VALIDATIONS.MAX_DATE))
            return false;
        
        // each exercise
        for(let e of session.exercises) {
            // exercise must be defined
            if(!e.exercise)
                return false;
            
            for(let s of e.series) {
                // series, rep, weight and rest must be defined and must be less and more than their limits
                if( 
                    (s.seriesNumber == null || s.seriesNumber < TRAINING_VALIDATIONS.MIN_SERIES_NUMBER || s.seriesNumber > TRAINING_VALIDATIONS.MAX_SERIES_NUMBER) ||
                    (s.repNumber == null || s.repNumber < TRAINING_VALIDATIONS.MIN_REP_NUMBER || s.repNumber > TRAINING_VALIDATIONS.MAX_REP_NUMBER) ||
                    (s.weight == null || s.weight < TRAINING_VALIDATIONS.MIN_WEIGHT_NUMBER || s.weight > TRAINING_VALIDATIONS.MAX_WEIGHT_NUMBER) ||
                    (s.rest == null || s.rest < TRAINING_VALIDATIONS.MIN_REST_TIME || s.rest > TRAINING_VALIDATIONS.MAX_REST_TIME)
                )
                    return false;
            }
        }

        return true;

    }

    function isWeekValidToSubmit(week) {

        // week comment length must be less than its limit
        if(week.comment.length > TRAINING_VALIDATIONS.MAX_WEEK_COMMENT_LENGTH)
            return false;
        
        // all week sessions must be valid
        for(let s of week.sessions) {
            if(!isSessionValidToSubmit(s))
                return false;
        }

        return true;

    }

    function isTrainingValidToSubmit(training) {

        // all basic training infos must be valid
        if(!areBasicTrainingInfosValidToSubmit(training))
            return false;

        // all training weeks must be valid
        for(let w of training.weeks) {
            if(!isWeekValidToSubmit(w))
                return false;
        }

        return true;
    }

    function areBasicTrainingInfosValidToSubmit(training) {
        
        // training comment length must be less than its limit
        if(training.comment.length > TRAINING_VALIDATIONS.MAX_TRAINING_COMMENT_LENGTH)
            return false;

        // training state and discipline must be valid
        if(training.state == null || training.type == null || training.type == '' || training.type.length < TRAINING_VALIDATIONS.MIN_TYPE_LENGTH || training.type.length > TRAINING_VALIDATIONS.MAX_TYPE_LENGTH)
            return false;

        // end date must be after start date, end date and start date must be before 2100-01-01
        if(moment(training.endDate).isBefore(training.startDate) || moment(training.endDate).isAfter(TRAINING_VALIDATIONS.MAX_DATE) || moment(training.startDate).isAfter(TRAINING_VALIDATIONS.MAX_DATE))
            return false;

        // athlete list must not be empty
        if(training.athletes.length == 0)
            return false;

        return true;
    }

}

