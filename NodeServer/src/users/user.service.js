const { User, Notification } = require('src/users/user.model.js');
const { NOTIFICATION_ONLY_DISMISS, NOTIFICATION_TYPE } = require('src/_helpers/enum.js');
const fileManager = require('src/_helpers/fileManager');
const fs = require('fs');
const _ = require('lodash');
const { validateEmail } = require('../_helpers/send-email');
const moment = require('moment');

/** REST CALLBACKS **/
module.exports = (io, clientSocketList) => {

    const notificationService = require('src/_helpers/notification.service')(io, clientSocketList);
    const TRAINING_VALIDATIONS = {MAX_SESSION_NAME_LENGTH: 50, MAX_SESSION_COMMENT_LENGTH: 100, MAX_SERIES_NUMBER: 99999, MIN_SERIES_NUMBER: 1, MAX_REP_NUMBER: 99999, MIN_REP_NUMBER: 1, MAX_WEIGHT_NUMBER: 99999, MIN_WEIGHT_NUMBER: 0, MAX_REST_TIME: 99999, MIN_REST_TIME: 0, MAX_DATE: "2100-01-01T00:00", MAX_WEEK_COMMENT_LENGTH: 500, MAX_TRAINING_COMMENT_LENGTH: 1000};
    const USER_VALIDATIONS = {MAX_PROFILE_PICTURE_NUMBER: 1, MAX_PROFILE_PICTURE_SIZE: 2, PROFILE_PICTURE_ACCEPTED_FORMATS: ['image/jpg', 'image/jpeg', 'image/png'], MAX_BIOGRAPHY_LENGTH: 1000, MAX_NAME_LENGTH: 30, MAX_SURNAME_LENGTH: 30, 
                              MIN_DATE: moment('1900-01-01T00:00'), MAX_DATE: moment(new Date()), MAX_GENERIC_RESIDENCE_FIELD_LENGTH: 100, MAX_CAP_LENGTH: 5, MAX_ADDRESS_LENGTH: 200, MIN_WEIGHT: 1, MAX_WEIGHT: 500, MIN_EXPERIENCE: 0, MAX_EXPERIENCE: 99, 
                              MAX_GENERIC_CONTACT_LENGTH: 100, MAX_EMAIL_LENGTH: 100, MAX_TELEPHONE_LENGTH: 15, MAX_PSW_LENGTH: 50};
    const SETTINGS_VALIDATIONS = {GENERIC_PRIVACY_VALUES: [0, 1, 2, "0", "1", "2"]};

    return {
        createUser,
        findAllUser,
        findAllAthlete,
        findAllCoaches,
        findOneUser,
        updateUser,
        deleteUser,
        sendNotification,
        acceptNotification,
        refuseNotification,
        dismissNotification,
        cancelAthleteCoachLink,
        dismissAllNotifications,
        cancelNotification,
        cancelAllNotifications
    };


    // Create and Save a new User
    function createUser (req, res, next) {
        // Validate request
        if (!req.body) {
            return res.status(400).send({
                message: "USER_CONTENT_EMPTY"
            });
        }

        // Create a User
        const user = new User({
            name: req.body.name,
            surname: req.body.surname,
            dateOfBirth: req.body.dateOfBirth,
            placeOfBirth: req.body.placeOfBirth,
            sex: req.body.sex,
            userType: req.body.userType,
            bodyWeight: req.body.bodyWeight,
            yearsOfExperience: req.body.yearsOfExperience,
            disciplines: req.body.disciplines,
            gyms: req.body.gyms,
            coaches: [],
            athletes: [],
            personalRecords: [],
            contacts: req.body.contacts,
            residence: req.body.residence,
            biography: req.body.biography,
            profilePicture: req.body.profilePicture,
            notifications: [],
            settings: req.body.settings || {}
        });

        // Save User in the database
        user.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "USER_CREATE_GENERIC_ERROR"
                });
            });
    };

    // Retrieve and return all users from the database.
    function findAllUser(req, res, next) {
        User.find().populate({path: 'personalRecords', populate: {path: 'exercise'}})
                .populate({path: 'notifications', populate: {path: 'from'}})
                .populate({path: 'notifications', populate: {path: 'destination'}})
                .populate('coaches').populate('athletes')
            .then(users => {
                res.send(_.sortBy(users, ['name', 'surname']));
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "USERS_GET_FAIL"
                });
            });
    };

    // Retrieve and return all users from the database.
    function findAllAthlete(req, res, next) {
        User.find().populate({path: 'personalRecords', populate: {path: 'exercise'}})
                .populate({path: 'notifications', populate: {path: 'from'}})
                .populate({path: 'notifications', populate: {path: 'destination'}})
                .populate('coaches').populate('athletes')
            .then(users => {
                res.send(_.sortBy(_.filter(users, function (user) { return (user.userType == "athlete" || user.userType == "both"); }), ['name', 'surname']));
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "USERS_GET_FAIL"
                });
            });
    };

    // Retrieve and return all users from the database.
    function findAllCoaches (req, res, next) {
        User.find().populate({path: 'personalRecords', populate: {path: 'exercise'}})
                .populate({path: 'notifications', populate: {path: 'from'}})
                .populate({path: 'notifications', populate: {path: 'destination'}})
                .populate('coaches').populate('athletes')
            .then(users => {
                res.send(_.sortBy(_.filter(users, function (user) { return (user.userType == "coach" || user.userType == "both"); }), ['name', 'surname']));
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "USERS_GET_FAIL"
                });
            });
    };

    // Find a single user with a id
    function findOneUser(req, res, next) {
        User.findById(req.params._id).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                            .populate({path: 'notifications', populate: {path: 'from'}})
                                            .populate({path: 'notifications', populate: {path: 'destination'}})
                                            .populate('coaches').populate('athletes')
            .then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: "USER_NOT_FOUND_ID", id: req.params._id
                    });
                }
                res.send(user);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "USER_NOT_FOUND_ID", id: req.params._id
                    });
                }
                return res.status(500).send({
                    message: "EXERCISE_ERROR_FOUND_ID", id: req.params._id
                });
            });
    };


    async function saveProfilePicture(fileDir, userId, profilePicture, bNewProfilePicture) {
        
        return new Promise((resolve, reject) => {
            // if it's a new image, than upload it and retrieve its path
            if (profilePicture && bNewProfilePicture) {  
                let filePath = fileDir + "/pp_" + userId + (new Date()).getMilliseconds() + ".jpeg";
                
                // If folders does not exist, create them
                if (!fs.existsSync(fileManager.imagesBaseDir))
                    fs.mkdirSync(fileManager.imagesBaseDir);
                if (!fs.existsSync(fileManager.usersImagesBaseDir))
                    fs.mkdirSync(fileManager.usersImagesBaseDir);
                if (!fs.existsSync(fileDir))
                    fs.mkdirSync(fileDir);

                // create the image and save it
                let src = profilePicture.replace(/(data:image)(.)*(;base64,)/, "");
                fs.writeFileSync(filePath, src, 'base64');
                resolve(filePath.replace("./", "/"));
            } 
            // else, it is an old yet uploaded image, so retrieve only its path
            else {
                resolve(profilePicture);
            }
        })

    }


    // Update a user identified by the id in the request
    function updateUser(req, res, next) {
        // Validate Request
        if (!req.body) {
            return res.status(400).send({
                message: "USER_CONTENT_EMPTY"
            });
        }

        if(!areUserInformationsValidForSubmission(req.body) || !arePersonalRecordsValidForSubmission(req.body.personalRecords) || !areSettingsValidForSubmission(req.body.settings))
            return res.status(500).send({message: "USER_CONTENT_INVALID"});

        // Save new profile picture if there is one, then update user
        let fileDir = fileManager.usersImagesBaseDir + "/" + req.params._id;
        saveProfilePicture(fileDir, req.params._id, req.body.profilePicture, req.body.bNewProfilePicture)
            .then((data) => {
                req.body.profilePicture = data;
                fileManager.clearImagesDirectory(fileDir, [req.body.profilePicture]);

                // Find user and update it with the request body
                User.findOneAndUpdate({ _id: req.params._id }, {
                    name: req.body.name,
                    surname: req.body.surname,
                    dateOfBirth: req.body.dateOfBirth,
                    placeOfBirth: req.body.placeOfBirth,
                    sex: req.body.sex,
                    userType: req.body.userType,
                    bodyWeight: req.body.bodyWeight,
                    yearsOfExperience: req.body.yearsOfExperience,
                    disciplines: req.body.disciplines,
                    gyms: req.body.gyms,
                    coaches: req.body.coaches,
                    athletes: req.body.athletes,
                    personalRecords: req.body.personalRecords,
                    contacts: req.body.contacts,
                    residence: req.body.residence,
                    biography: req.body.biography,
                    profilePicture: req.body.profilePicture,
                    notifications: _.orderBy(req.body.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                    settings: req.body.settings
                }, { new: true })
                    .then(user => {
                        if (!user) {
                            return res.status(404).send({
                                message: "USER_NOT_FOUND_ID", id: req.params._id
                            });
                        }

                        // Returns the user update by finding it in the database
                        User.findById(user._id).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                                    .populate({path: 'notifications', populate: {path: 'from'}})
                                                    .populate({path: 'notifications', populate: {path: 'destination'}})
                                                    .populate('coaches').populate('athletes')
                            .then(users => {
                                res.send(users);
                            })
                    }).catch(err => {
                        if (err.kind === 'ObjectId') {
                            return res.status(404).send({
                                message: "USER_NOT_FOUND_ID", id: req.params._id
                            });
                        }
                        return res.status(500).send({
                            message: "USER_ERROR_FOUND_ID", id: req.params._id
                        });
                    });  

            }).catch((err) => {
                return res.status(500).send({
                    message: "USER_IMAGE_ERROR",
                    err: err
                });
            })
    };

    // Delete a user with the specified id in the request
    function deleteUser(req, res, next) {
        User.findOneAndRemove({ _id: req.params._id })
            .then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: "USER_NOT_FOUND_ID", id: req.params._id
                    });
                }
                res.send({ message: "USER_DELETE_SUCCESS" });
            }).catch(err => {
                if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                    return res.status(404).send({
                        message: "USER_NOT_FOUND_ID", id: req.params._id
                    });
                }
                return res.status(500).send({
                    message: "USER_DELETE_FAIL_ID", id: req.params._id
                });
            });
    };

    function isLinkRequestYetSent(fromUser, destUser, nType) {
        return ( destUser.notifications.find((n)=> { return (n.type == nType && n.from.equals(fromUser._id) && !n.bConsumed)} ) != undefined);
    }

    // Add a notification to a given User
    function sendNotification(req, res, next) {
        // Validate request
        if (!req.body) { return res.status(400).send({ message: "NOTIFICATION_CONTENT_EMPTY" }); }

        Promise.all([
            User.findOne({ _id: req.params._id }),
            User.findOne({ _id: req.body.from })
        ])
            .then(([dUser, fUser]) => {
                if (!dUser || !fUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                // 1. Check if request type is coach or athlete request and the link between coach and athlete does not exist (if it exists the notification can't be sent) or if the request has been yet sent
                if((req.body.type == NOTIFICATION_TYPE.COACH_REQUEST && (!isLinkYetEstablished(dUser, fUser) && !isLinkRequestYetSent(fUser, dUser, NOTIFICATION_TYPE.COACH_REQUEST))) ||
                   (req.body.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && (!isLinkYetEstablished(fUser, dUser) && !isLinkRequestYetSent(fUser, dUser, NOTIFICATION_TYPE.ATHLETE_REQUEST))) ||
                   (req.body.type != NOTIFICATION_TYPE.COACH_REQUEST && req.body.type != NOTIFICATION_TYPE.ATHLETE_REQUEST)) {

                    // 2. Push the new notification in destination user
                    dUser.notifications.push(new Notification({ type: req.body.type, from: req.body.from, destination: req.body.destination, message: req.body.message, bConsumed: req.body.bConsumed, creationDate: req.body.creationDate }));

                    // 3. Find user and update it with the request body
                    User.findOneAndUpdate({ _id: req.params._id }, {
                        notifications: _.orderBy(dUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc'], ['asc', 'desc'])
                    }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                    .populate({path: 'notifications', populate: {path: 'from'}})
                                    .populate({path: 'notifications', populate: {path: 'destination'}})
                                    .populate('coaches').populate('athletes')
                        .then(user => {
                            if (!user) { return res.status(404).send({ message: "USER_NOT_FOUND_ID", id: req.params._id }); }

                            // 4. Update destUser informations in destUser and fromUser clients
                            notificationService.sendUpdatedUserToItsSocket(user);    
                            notificationService.sendUpdatedUserToClientSocket(user, req.body.from);

                            // 5. Send response to calling client
                            res.send(user);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND_ID", id: req.params._id }); }
                            return res.status(500).send({ message: "USER_ERROR_UPDATE_ID", id: req.params._id});
                        });
                } else {
                    return res.status(500).send({ message: "NOTIFICATION_SENT_GENERIC_ERROR" });
                }
                
                
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "USER_ERROR_UPDATE_ID", id: req.params._id});
            });
    };

    // Accept a notification for a given User
    function acceptNotification(req, res, next) {
        let destinationUser;
        let fromUser;
        let notification = req.body;

        // Find destination and from users
        Promise.all([
            User.findOne({ _id: req.params._id }),
            User.findOne({ _id: notification.from })
        ])
            .then(([dUser, fUser]) => {
                if (!dUser || !fUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                destinationUser = dUser;
                fromUser = fUser;

                // 1. in destination user set the notification as consumed and pop exceeded elements in the notifications list 
                if(notificationService.consumeAndCleanNotifications(destinationUser, req.params._notId)) {

                    // 2. update destiantion and from coaches and athletes lists (only if there is no existing link between coach and athlete)
                    if ( notification.type == NOTIFICATION_TYPE.COACH_REQUEST && !isLinkYetEstablished(destinationUser, fromUser) ) {
                        destinationUser.athletes.push(notification.from._id);
                        fromUser.coaches.push(destinationUser._id);
                    } 
                    else if ( notification.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && !isLinkYetEstablished(fromUser, destinationUser) ) {
                        destinationUser.coaches.push(notification.from);
                        fromUser.athletes.push(destinationUser._id);
                    } else {
                        return res.status(500).send({ message: "NOTIFICATION_LINK_YET_EXISTS_ERROR" });
                    }

                    // 3. add a notification to the from user (to inform about the request success)
                    let message = "L'utente " + destinationUser.name + " " + destinationUser.surname + " ha accettato la richiesta di " + (notification.type == NOTIFICATION_TYPE.COACH_REQUEST ? "coaching (è ora un tuo coach)" : (notification.type == NOTIFICATION_TYPE.ATHLETE_REQUEST ? 'coaching (è ora un tuo atleta)' : ''));
                    fromUser.notifications.push(new Notification({ type: NOTIFICATION_TYPE.REQUEST_SUCCESS, from: destinationUser._id, destination: fromUser._id, message: message, bConsumed: false, creationDate: new Date() }));

                    // 4. update from and destination users
                    Promise.all([
                        User.findOneAndUpdate({ _id: destinationUser._id }, {
                            notifications: _.orderBy(destinationUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc'], ['asc', 'desc']),
                            coaches: destinationUser.coaches,
                            athletes: destinationUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes'),
                        User.findOneAndUpdate({ _id: fromUser._id }, {
                            notifications: _.orderBy(fromUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc'], ['asc', 'desc']),
                            coaches: fromUser.coaches,
                            athletes: fromUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes')
                    ])
                        .then(([destinationUser, fromUser]) => {
                            if (!destinationUser || !fromUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                            // Update fromUser and destUser informations in destUser client
                            notificationService.sendUpdatedUserToItsSocket(destinationUser);                    
                            notificationService.sendUpdatedUserToClientSocket(fromUser, destinationUser._id);

                            // Update fromUser and destUser informations in fromUser client
                            notificationService.sendUpdatedUserToItsSocket(fromUser);           
                            notificationService.sendUpdatedUserToClientSocket(destinationUser, fromUser._id);

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                            return res.status(500).send({ message: "NOTIFICATION_ACCEPT_UPDATE_USER_ERROR" });
                        });
                } else {
                    return res.status(500).send({ message: "NOTIFICATION_ACCEPT_UPDATE_USER_ERROR_SPECIFIC" });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "NOTIFICATION_ACCEPT_UPDATE_USER_ERROR" });
            });
    };

    function refuseNotification(req, res, next) {
        let destinationUser;
        let fromUser;
        let notification = req.body;

        // Find destination and from users
        Promise.all([
            User.findOne({ _id: req.params._id }),
            User.findOne({ _id: notification.from })
        ])
            .then(([dUser, fUser]) => {
                if (!dUser || !fUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                destinationUser = dUser;
                fromUser = fUser;

                // 1. in destination user set the notification as consumed and pop exceeded elements in the notifications list
                if(notificationService.consumeAndCleanNotifications(destinationUser, req.params._notId)) {
                    
                    // 2. add a notification to the from user (to inform about the refused request)
                    let message = "L'utente " + destinationUser.name + " " + destinationUser.surname + " ha RIFIUTATO la richiesta di " + (notification.type == NOTIFICATION_TYPE.COACH_REQUEST ? "seguirti come coach" : (notification.type == NOTIFICATION_TYPE.ATHLETE_REQUEST ? 'essere seguito come atleta' : ''));
                    fromUser.notifications.push(new Notification({ type: NOTIFICATION_TYPE.REQUEST_REFUSE, from: destinationUser._id, destination: fromUser._id, message: message, bConsumed: false, creationDate: new Date() }));

                    // 3. update from and destination users
                    Promise.all([
                        User.findOneAndUpdate({ _id: destinationUser._id }, {
                            notifications: _.orderBy(destinationUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: destinationUser.coaches,
                            athletes: destinationUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes'),
                        User.findOneAndUpdate({ _id: fromUser._id }, {
                            notifications: _.orderBy(fromUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: fromUser.coaches,
                            athletes: fromUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes')
                    ])
                        .then(([destinationUser, fromUser]) => {
                            if (!destinationUser || !fromUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                            // Update fromUser and destUser informations in destUser client
                            notificationService.sendUpdatedUserToItsSocket(destinationUser);                    
                            notificationService.sendUpdatedUserToClientSocket(fromUser, destinationUser._id);

                            // Update fromUser and destUser informations in fromUser client
                            notificationService.sendUpdatedUserToItsSocket(fromUser);           
                            notificationService.sendUpdatedUserToClientSocket(destinationUser, fromUser._id);

                            // Send response to calling client
                            res.send(destinationUser); 
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                            return res.status(500).send({ message: "NOTIFICATION_REFUSE_UPDATE_USER_ERROR" });
                        });
                } else {
                    return res.status(500).send({ message: "NOTIFICATION_REFUSE_UPDATE_USER_ERROR_SPECIFIC" });
                }

            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "NOTIFICATION_REFUSE_UPDATE_USER_ERROR" });
            });
    };

    function dismissNotification(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                destinationUser = dUser;
                let notificationToConsumeIndex = _.findIndex(destinationUser.notifications, function(n) { return n._id == req.params._notId; });
                let notificationToConsume = notificationToConsumeIndex != -1 ? destinationUser.notifications[notificationToConsumeIndex] : null;
                
                // 1. in destination user set the notification as consumed and pop exceeded elements in the notifications list
                if(notificationService.consumeAndCleanNotifications(destinationUser, req.params._notId)) {

                    // 2. update destination user
                    Promise.all([
                        User.findOneAndUpdate({ _id: destinationUser._id }, {
                            notifications: _.orderBy(destinationUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: destinationUser.coaches,
                            athletes: destinationUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes')
                    ])
                        .then(([destinationUser]) => {
                            if (!destinationUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                            // Update destUser informations in destUser client
                            notificationService.sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser client
                            notificationService.sendUpdatedUserToClientSocket(destinationUser, notificationToConsume.from);

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                            return res.status(500).send({ message: "NOTIFICATION_DISMISS_UPDATE_USER_ERROR" });
                        });
                } else {
                    return res.status(500).send({ message: "NOTIFICATION_DISMISS_UPDATE_USER_ERROR_SPECIFIC" });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "NOTIFICATION_DISMISS_UPDATE_USER_ERROR" });
            });
    };

    function cancelAthleteCoachLink(req, res, next) {
        // Validate request
        if (!req.body) { return res.status(400).send({ message: "NOTIFICATION_CONTENT_EMPTY" }); }

        let notification = new Notification({ type: req.body.type, from: req.body.from, destination: req.body.destination, message: req.body.message, bConsumed: req.body.bConsumed, creationDate: req.body.creationDate });
        let coachUser;
        let athleteUser;

        Promise.all([ 
            User.findOne({ _id: req.params._id }),
            User.findOne({ _id: notification.from })
        ])
            .then(([dUser, fUser]) => {
                if (!dUser || !fUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                // 1. Assign coach and athlete user roles in order to operate on them properly (depeding on the link request cancellation direction we have to cancel the link in the proper direction).
                switch (notification.type) {
                    case NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK:
                        coachUser = dUser;
                        athleteUser = fUser;
                        break;
                    case NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK:
                        coachUser = fUser;
                        athleteUser = dUser;
                        break;
                }

                // 2. Cancel the link between athlete and coach, if it exists, else return an error
                let coachToRemoveIndex = _.findIndex(coachUser.athletes, function(a) { return athleteUser._id.equals(a) });
                let athleteToRemoveIndex = _.findIndex(athleteUser.coaches, function(c) { return coachUser._id.equals(c) });
                if(coachToRemoveIndex != -1 && athleteToRemoveIndex != -1) {
                    coachUser.athletes.splice(coachToRemoveIndex, 1);
                    athleteUser.coaches.splice(athleteToRemoveIndex, 1);

                    // 3. Add a notification in coach and athlete to notify them about the link cancellation
                    coachUser.notifications.push(notification);
                    athleteUser.notifications.push(notification);

                    // 4. Find and update coach and athlete in the database
                    Promise.all([
                        User.findOneAndUpdate({ _id: coachUser._id }, {
                            notifications: _.orderBy(coachUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: coachUser.coaches,
                            athletes: coachUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes'),
                        User.findOneAndUpdate({ _id: athleteUser._id }, {
                            notifications: _.orderBy(athleteUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: athleteUser.coaches,
                            athletes: athleteUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes')
                    ])
                    .then(([cUser, aUser]) => {
                        if (!cUser || !aUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                        let fromUser = (cUser._id.equals(notification.from) ? cUser : aUser);
                        let destinationUser = (cUser._id.equals(notification.destination) ? cUser : aUser);

                        // Update fromUser and destUser informations in destUser client
                        notificationService.sendUpdatedUserToItsSocket(destinationUser);                    
                        notificationService.sendUpdatedUserToClientSocket(fromUser, destinationUser._id);

                        // Update fromUser and destUser informations in fromUser client
                        notificationService.sendUpdatedUserToItsSocket(fromUser);           
                        notificationService.sendUpdatedUserToClientSocket(destinationUser, fromUser._id);

                        // Send response to calling client
                        res.send({destUser: destinationUser, fromUser: fromUser}); 
                    }).catch(err => {
                        if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                        return res.status(500).send({ message: "NOTIFICATION_CANCEL_LINK_UPDATE_USER_ERROR" });
                    });
                } else {
                    res.status(500).send({ message: "NOTIFICATION_CANCEL_LINK_UPDATE_USER_ERROR_SPECIFIC" });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "NOTIFICATION_CANCEL_LINK_UPDATE_USER_ERROR" });
            });
    };

    function dismissAllNotifications(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                destinationUser = dUser;
                let notificationToConsumeList = _.filter(destinationUser.notifications, function(n) { return !n.bConsumed && NOTIFICATION_ONLY_DISMISS.includes(n.type); });
                
                // 1. Check if there are some notification to be consumed, and if yes, consume them (just consume all notifications that does not need confirmation, but only dismiss)
                if(notificationToConsumeList.length > 0) {
                    for(let i=0; i<destinationUser.notifications.length; i++) {
                        if(!destinationUser.notifications[i].bConsumed && NOTIFICATION_ONLY_DISMISS.includes(destinationUser.notifications[i].type))
                            notificationService.consumeAndCleanNotifications(destinationUser, destinationUser.notifications[i]._id)
                    }

                    // 2. update destination user
                    Promise.all([
                        User.findOneAndUpdate({ _id: destinationUser._id }, {
                            notifications: _.orderBy(destinationUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: destinationUser.coaches,
                            athletes: destinationUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes')
                    ])
                        .then(([destinationUser]) => {
                            if (!destinationUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                            // Update destUser informations in destUser client
                            notificationService.sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser clients
                            for(let j=0; j<notificationToConsumeList.length; j++) {
                                notificationService.sendUpdatedUserToClientSocket(destinationUser, notificationToConsumeList[j].from);
                            }

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                            return res.status(500).send({ message: "NOTIFICATIONS_DISMISS_UPDATE_USER_ERROR" });
                        });
                } else {
                    return res.status(500).send({ message: "NOTIFICATIONS_DISMISS_UPDATE_USER_ERROR_SPECIFIC" });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "NOTIFICATIONS_DISMISS_UPDATE_USER_ERROR" });
            });
    }

    function cancelNotification(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                destinationUser = dUser;
                let notificationToCancelIndex = _.findIndex(destinationUser.notifications, function(n) { return n._id == req.params._notId && n.bConsumed; });      // Note: we check if the notification is also bConsumed because a notification can be cancelled only if it is consumed
                let notificationToCancel = notificationToCancelIndex != -1 ? destinationUser.notifications[notificationToCancelIndex] : null;
                
                // Proceed only if the notification to cancel is found and can be cancelled
                if(notificationToCancelIndex != -1) {

                    // 1. in destination user cancel the notification
                    destinationUser.notifications.splice(notificationToCancelIndex, 1);

                    // 2. update destination user
                    Promise.all([
                        User.findOneAndUpdate({ _id: destinationUser._id }, {
                            notifications: _.orderBy(destinationUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: destinationUser.coaches,
                            athletes: destinationUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes')
                    ])
                        .then(([destinationUser]) => {
                            if (!destinationUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                            // Update destUser informations in destUser client
                            notificationService.sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser client
                            notificationService.sendUpdatedUserToClientSocket(destinationUser, notificationToCancel.from);

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                            return res.status(500).send({ message: "NOTIFICATION_DELETE_UPDATE_USER_ERROR" });
                        });
                } else {
                    return res.status(500).send({ message: "NOTIFICATION_DELETE_UPDATE_USER_ERROR_SPECIFIC" });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "NOTIFICATION_DELETE_UPDATE_USER_ERROR" });
            });
    }

    function cancelAllNotifications(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                destinationUser = dUser;

                // 1. Remove all notifications that have been already consumed
                let notificationToCancelList = _.remove(destinationUser.notifications, function(n) { return n.bConsumed; });                   
                
                if(notificationToCancelList.length > 0) {

                    // 2. update destination user
                    Promise.all([
                        User.findOneAndUpdate({ _id: destinationUser._id }, {
                            notifications: _.orderBy(destinationUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
                            coaches: destinationUser.coaches,
                            athletes: destinationUser.athletes
                        }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                        .populate({path: 'notifications', populate: {path: 'from'}})
                                        .populate({path: 'notifications', populate: {path: 'destination'}})
                                        .populate('coaches').populate('athletes')
                    ])
                        .then(([destinationUser]) => {
                            if (!destinationUser) { return res.status(404).send({ message: "USER_NOT_FOUND" }); }

                            // Update destUser informations in destUser client
                            notificationService.sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser clients
                            for(let i=0; i<notificationToCancelList.length; i++) {
                                notificationService.sendUpdatedUserToClientSocket(destinationUser, notificationToCancelList[i].from);
                            }

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                            return res.status(500).send({ message: "NOTIFICATIONS_DELETE_UPDATE_USER_ERROR" });
                        });
                } else {
                    return res.status(500).send({ message: "NOTIFICATIONS_DELETE_UPDATE_USER_ERROR_SPECIFIC" });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "USER_NOT_FOUND" }); }
                return res.status(500).send({ message: "NOTIFICATIONS_DELETE_UPDATE_USER_ERROR" });
            });
    }

    /* UTILS */
    function isLinkYetEstablished(coach, athlete) {
        return (coach.athletes.includes(athlete._id) || athlete.coaches.includes(coach._id));
    }

    function areUserInformationsValidForSubmission(user) {

        // profile picture must be one, less than 2MB and format .png, .jpg or .jpeg
        if(user.profilePicture && user.bNewProfilePicture) {
            if((Number((((Buffer.byteLength(user.profilePicture, 'base64'))/1024)/1024).toFixed(4)) >= USER_VALIDATIONS.MAX_PROFILE_PICTURE_SIZE))
                return false;
            
            let ret = false;
            for(e of USER_VALIDATIONS.PROFILE_PICTURE_ACCEPTED_FORMATS) {
                if(user.profilePicture.includes(e)) {
                    ret = true;
                    break;
                }
            }
            if(!ret) return false;
        }

        // Other informations must be valid
        if(
            (user.biography != null && user.biography.length > USER_VALIDATIONS.MAX_BIOGRAPHY_LENGTH) ||
            (user.name == null || user.name.length == 0 || user.name.length > USER_VALIDATIONS.MAX_NAME_LENGTH) ||
            (user.surname  == null || user.surname.length == 0 || user.surname.length > USER_VALIDATIONS.MAX_SURNAME_LENGTH) ||
            ((moment(user.dateOfBirth)).isValid() && moment(user.dateOfBirth).isBefore(USER_VALIDATIONS.MIN_DATE) || moment(user.dateOfBirth).isAfter(USER_VALIDATIONS.MAX_DATE)) ||
            (user.placeOfBirth.state != null && user.placeOfBirth.state.length > USER_VALIDATIONS.MAX_GENERIC_RESIDENCE_FIELD_LENGTH) ||
            (user.placeOfBirth.province != null && user.placeOfBirth.province.length > USER_VALIDATIONS.MAX_GENERIC_RESIDENCE_FIELD_LENGTH) ||
            (user.placeOfBirth.cap != null && user.placeOfBirth.cap.length > USER_VALIDATIONS.MAX_CAP_LENGTH) ||
            (user.placeOfBirth.city != null && user.placeOfBirth.city.length > USER_VALIDATIONS.MAX_GENERIC_RESIDENCE_FIELD_LENGTH) ||
            (user.placeOfBirth.address != null && user.placeOfBirth.address.length > USER_VALIDATIONS.MAX_ADDRESS_LENGTH) ||
            (user.sex != null && (user.sex != 'M' && user.sex != 'F')) ||
            (user.bodyWeight != null && (user.bodyWeight < USER_VALIDATIONS.MIN_WEIGHT || user.bodyWeight > USER_VALIDATIONS.MAX_WEIGHT)) ||
            (user.yearsOfExperience != null && (user.yearsOfExperience < USER_VALIDATIONS.MIN_EXPERIENCE || user.yearsOfExperience > USER_VALIDATIONS.MAX_EXPERIENCE)) ||
            (user.contacts.email != null && (user.contacts.email.length > USER_VALIDATIONS.MAX_EMAIL_LENGTH || !validateEmail(user.contacts.email))) ||
            (user.contacts.telephone != null && (user.contacts.telephone.length > USER_VALIDATIONS.MAX_TELEPHONE_LENGTH)) ||
            (user.contacts.socials.facebook != null && (user.contacts.socials.facebook.length > USER_VALIDATIONS.MAX_GENERIC_CONTACT_LENGTH)) ||
            (user.contacts.socials.twitter != null && (user.contacts.socials.twitter.length > USER_VALIDATIONS.MAX_GENERIC_CONTACT_LENGTH)) ||
            (user.contacts.socials.instagram != null && (user.contacts.socials.instagram.length > USER_VALIDATIONS.MAX_GENERIC_CONTACT_LENGTH)) ||
            (user.contacts.socials.linkedin != null && (user.contacts.socials.linkedin.length > USER_VALIDATIONS.MAX_GENERIC_CONTACT_LENGTH)) ||
            (user.contacts.socials.other != null && (user.contacts.socials.other.length > USER_VALIDATIONS.MAX_GENERIC_CONTACT_LENGTH)) ||
            (user.residence.state != null && user.residence.state.length > USER_VALIDATIONS.MAX_GENERIC_RESIDENCE_FIELD_LENGTH) ||
            (user.residence.province != null && user.residence.province.length > USER_VALIDATIONS.MAX_GENERIC_RESIDENCE_FIELD_LENGTH) ||
            (user.residence.cap != null && user.residence.cap.length > USER_VALIDATIONS.MAX_CAP_LENGTH) ||
            (user.residence.city != null && user.residence.city.length > USER_VALIDATIONS.MAX_GENERIC_RESIDENCE_FIELD_LENGTH) ||
            (user.residence.address != null && user.residence.address.length > USER_VALIDATIONS.MAX_ADDRESS_LENGTH)
        )
            return false;
        
        return true;
    }

    function arePersonalRecordsValidForSubmission(personalRecordList) {
        for (let i = 0; i < personalRecordList.length; i++) {
    
          // Exercise must be valid
          if (!personalRecordList[i].exercise.name)
            return false;
    
          // series, rep, weight and rest must be defined and must be less and more than their limits
          for(let s of personalRecordList[i].series) {
            if( 
                (s.seriesNumber == null || s.seriesNumber < TRAINING_VALIDATIONS.MIN_SERIES_NUMBER || s.seriesNumber > TRAINING_VALIDATIONS.MAX_SERIES_NUMBER) ||
                (s.repNumber == null || s.repNumber < TRAINING_VALIDATIONS.MIN_REP_NUMBER || s.repNumber > TRAINING_VALIDATIONS.MAX_REP_NUMBER) ||
                (s.weight == null || s.weight < TRAINING_VALIDATIONS.MIN_WEIGHT_NUMBER || s.weight > TRAINING_VALIDATIONS.MAX_WEIGHT_NUMBER) ||
                (s.rest == null || s.rest < TRAINING_VALIDATIONS.MIN_REST_TIME || s.rest > TRAINING_VALIDATIONS.MAX_REST_TIME) ||
                (s.comment.length > TRAINING_VALIDATIONS.MAX_SESSION_COMMENT_LENGTH)
            )
              return false;
          }
    
          //one rep pr must be valid
          if(personalRecordList[i].oneRepPR.weight == null || personalRecordList[i].oneRepPR.weight < TRAINING_VALIDATIONS.MIN_WEIGHT_NUMBER || personalRecordList[i].oneRepPR.weight > TRAINING_VALIDATIONS.MAX_WEIGHT_NUMBER || !personalRecordList[i].oneRepPR.measure)
            return false;
        }
    
        return true;
      }

    function areSettingsValidForSubmission(settings) {
        if( 
            (settings.showActivities == null || !SETTINGS_VALIDATIONS.GENERIC_PRIVACY_VALUES.includes(settings.showActivities)) ||
            (settings.showPrivateInfo == null || !SETTINGS_VALIDATIONS.GENERIC_PRIVACY_VALUES.includes(settings.showPrivateInfo)) ||
            (settings.showPublicInfo == null || !SETTINGS_VALIDATIONS.GENERIC_PRIVACY_VALUES.includes(settings.showPublicInfo))
        )
            return false;

        return true;
    }

}