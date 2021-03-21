const { User, Notification } = require('src/users/user.model.js');
const _ = require('lodash');
const { NotificationSchema } = require('./user.model');
const { concat, isObject } = require('lodash');
const MAX_NOTIFICATION_LIST_LENGTH = 100;

const NOTIFICATION_TYPE = {
    COACH_REQUEST: "coach_request",
    ATHLETE_REQUEST: "athlete_request",
    REQUEST_SUCCESS: "request_success",
    REQUEST_REFUSE: "request_refuse",
    CANCEL_ATHLETE_TO_COACH_LINK: "cancel_athlete_to_coach_link",
    CANCEL_COACH_TO_ATHLETE_LINK: "cancel_coach_to_athlete_link",
    CANCEL_ATHLETE_TO_COACH_LINK_REQUEST: "cancel_athlete_to_coach_link_request",
    CANCEL_COACH_TO_ATHLETE_LINK_REQUEST: "cancel_coach_to_athlete_link_request",
    DISMISS: "dismiss"
}

const NOTIFICATION_ONLY_DISMISS = [
    NOTIFICATION_TYPE.REQUEST_SUCCESS,
    NOTIFICATION_TYPE.REQUEST_REFUSE,
    NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK,
    NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK,
    NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK_REQUEST,
    NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK_REQUEST,
    NOTIFICATION_TYPE.DISMISS,
]

/** REST CALLBACKS **/

module.exports = (io, clientSocketList) => {
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
            personalRecords: [],
            notifications: [],
            coaches: [],
            athletes: []
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
    function findAllUser(req, res, next) {
        User.find().populate({path: 'personalRecords', populate: {path: 'exercise'}})
                .populate({path: 'notifications', populate: {path: 'from'}})
                .populate({path: 'notifications', populate: {path: 'destination'}})
                .populate('coaches').populate('athletes')
            .then(users => {
                res.send(_.sortBy(users, ['name', 'surname']));
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving users."
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
                    message: err.message || "Some error occurred while retrieving users."
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
                    message: err.message || "Some error occurred while retrieving users."
                });
            });
    };

    // Find a single user with a id
    function findOneUser(req, res, next) {
        User.find({ _id: req.params._id }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                            .populate({path: 'notifications', populate: {path: 'from'}})
                                            .populate({path: 'notifications', populate: {path: 'destination'}})
                                            .populate('coaches').populate('athletes')
            .then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: "User not found with id " + req.params._id
                    });
                }
                res.send(user[0]);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
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
    function updateUser(req, res, next) {
        // Validate Request
        if (!req.body) {
            return res.status(400).send({
                message: "User content can not be empty"
            });
        }

        // Find user and update it with the request body
        User.findOneAndUpdate({ _id: req.params._id }, {
            bodyWeight: req.body.bodyWeight,
            userType: req.body.userType,
            yearsOfExperience: req.body.yearsOfExperience,
            name: req.body.name,
            surname: req.body.surname,
            dateOfBirth: req.body.dateOfBirth,
            sex: req.body.sex,
            contacts: req.body.contacts,
            residence: req.body.residence,
            personalRecords: req.body.personalRecords,
            notifications: _.orderBy(req.body.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc']),
            coaches: req.body.coaches,
            athletes: req.body.athletes
        }, { new: true })
            .then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: "User not found with id " + req.params._id
                    });
                }

                // Returns the user update by finding it in the database
                User.find({ _id: user._id }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                            .populate({path: 'notifications', populate: {path: 'from'}})
                                            .populate({path: 'notifications', populate: {path: 'destination'}})
                                            .populate('coaches').populate('athletes')
                    .then(users => {
                        res.send(users[0]);
                    })
            }).catch(err => {
                if (err.kind === 'ObjectId') {
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
    function deleteUser(req, res, next) {
        User.findOneAndRemove({ _id: req.params._id })
            .then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: "User not found with id " + req.params._id
                    });
                }
                res.send({ message: "User deleted successfully!" });
            }).catch(err => {
                if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                    return res.status(404).send({
                        message: "User not found with id " + req.params._id
                    });
                }
                return res.status(500).send({
                    message: "Could not delete user with id " + req.params._id
                });
            });
    };

    // Add a notification to a given User
    function sendNotification(req, res, next) {
        // Validate request
        if (!req.body) { return res.status(400).send({ message: "Notification content can not be empty" }); }

        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "User not found" }); }

                destinationUser = dUser;
                destinationUser.notifications.push(new Notification({ type: req.body.type, from: req.body.from, destination: req.body.destination, message: req.body.message, bConsumed: req.body.bConsumed, creationDate: req.body.creationDate }));

                // Find user and update it with the request body
                User.findOneAndUpdate({ _id: req.params._id }, {
                    notifications: _.orderBy(destinationUser.notifications, ['bConsumed', 'creationDate'], ['asc', 'desc'], ['asc', 'desc'])
                }, { new: true }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                .populate({path: 'notifications', populate: {path: 'from'}})
                                .populate({path: 'notifications', populate: {path: 'destination'}})
                                .populate('coaches').populate('athletes')
                    .then(user => {
                        if (!user) { return res.status(404).send({ message: "User not found with id " + req.params._id }); }

                        // Update destUser informations in destUser client
                        sendUpdatedUserToItsSocket(user);    

                        // Update destUser informations in fromUser client
                        sendUpdatedUserToClientSocket(user, req.body.from);

                        // Send response to calling client
                        res.send(user);                      
                    }).catch(err => {
                        if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found with id " + req.params._id }); }
                        return res.status(500).send({ message: "Error updating user with id " + req.params._id });
                    });
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in sendNotification" });
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
                if (!dUser || !fUser) { return res.status(404).send({ message: "User not found" }); }

                destinationUser = dUser;
                fromUser = fUser;

                // 1. in destination user set the notification as consumed and pop exceeded elements in the notifications list
                if(consumeAndCleanNotifications(destinationUser, req.params._notId)) {

                    // 2. update destiantion and from coaches and athletes lists
                    if (notification.type == NOTIFICATION_TYPE.COACH_REQUEST) {
                        destinationUser.athletes.push(notification.from);
                        fromUser.coaches.push(destinationUser._id);
                    }
                    if (notification.type == NOTIFICATION_TYPE.ATHLETE_REQUEST) {
                        destinationUser.coaches.push(notification.from);
                        fromUser.athletes.push(destinationUser._id);
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
                            if (!destinationUser || !fromUser) { return res.status(404).send({ message: "User not found" }); }

                            // Update fromUser and destUser informations in destUser client
                            sendUpdatedUserToItsSocket(destinationUser);                    
                            sendUpdatedUserToClientSocket(fromUser, destinationUser._id);

                            // Update fromUser and destUser informations in fromUser client
                            sendUpdatedUserToItsSocket(fromUser);           
                            sendUpdatedUserToClientSocket(destinationUser, fromUser._id);

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                            return res.status(500).send({ message: "Error updating user in accept notification" });
                        });
                } else {
                    return res.status(500).send({ message: "Error updating user in accept notification: notification to accept not found." });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in accept notification" });
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
                if (!dUser || !fUser) { return res.status(404).send({ message: "User not found" }); }

                destinationUser = dUser;
                fromUser = fUser;

                // 1. in destination user set the notification as consumed and pop exceeded elements in the notifications list
                if(consumeAndCleanNotifications(destinationUser, req.params._notId)) {
                    
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
                            if (!destinationUser || !fromUser) { return res.status(404).send({ message: "User not found" }); }

                            // Update fromUser and destUser informations in destUser client
                            sendUpdatedUserToItsSocket(destinationUser);                    
                            sendUpdatedUserToClientSocket(fromUser, destinationUser._id);

                            // Update fromUser and destUser informations in fromUser client
                            sendUpdatedUserToItsSocket(fromUser);           
                            sendUpdatedUserToClientSocket(destinationUser, fromUser._id);

                            // Send response to calling client
                            res.send(destinationUser); 
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                            return res.status(500).send({ message: "Error updating user in refuseNotification" });
                        });
                } else {
                    return res.status(500).send({ message: "Error updating user in refuseNotification: notification to refuse not found." });
                }

            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in refuseNotification" });
            });
    };

    function dismissNotification(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "User not found" }); }

                destinationUser = dUser;
                let notificationToConsumeIndex = _.findIndex(destinationUser.notifications, function(n) { return n._id == req.params._notId; });
                let notificationToConsume = notificationToConsumeIndex != -1 ? destinationUser.notifications[notificationToConsumeIndex] : null;
                
                // 1. in destination user set the notification as consumed and pop exceeded elements in the notifications list
                if(consumeAndCleanNotifications(destinationUser, req.params._notId)) {

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
                            if (!destinationUser) { return res.status(404).send({ message: "User not found" }); }

                            // Update destUser informations in destUser client
                            sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser client
                            sendUpdatedUserToClientSocket(destinationUser, notificationToConsume.from);

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                            return res.status(500).send({ message: "Error updating user in dismissNotification" });
                        });
                } else {
                    return res.status(500).send({ message: "Error updating user in dismissNotification: notification to dismiss not found." });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in dismissNotification" });
            });
    };

    function cancelAthleteCoachLink(req, res, next) {
        // Validate request
        if (!req.body) { return res.status(400).send({ message: "Notification content can not be empty" }); }

        let notification = new Notification({ type: req.body.type, from: req.body.from, destination: req.body.destination, message: req.body.message, bConsumed: req.body.bConsumed, creationDate: req.body.creationDate });
        let coachUser;
        let athleteUser;

        Promise.all([ 
            User.findOne({ _id: req.params._id }),
            User.findOne({ _id: notification.from })
        ])
            .then(([dUser, fUser]) => {
                if (!dUser || !fUser) { return res.status(404).send({ message: "User not found" }); }

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

                // 2. Cancel the link between athlete and coach, if they exists, else return an error
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
                        if (!cUser || !aUser) { return res.status(404).send({ message: "User not found" }); }

                        let fromUser = (cUser._id.equals(notification.from) ? cUser : aUser);
                        let destinationUser = (cUser._id.equals(notification.destination) ? cUser : aUser);

                        // Update fromUser and destUser informations in destUser client
                        sendUpdatedUserToItsSocket(destinationUser);                    
                        sendUpdatedUserToClientSocket(fromUser, destinationUser._id);

                        // Update fromUser and destUser informations in fromUser client
                        sendUpdatedUserToItsSocket(fromUser);           
                        sendUpdatedUserToClientSocket(destinationUser, fromUser._id);

                        // Send response to calling client
                        res.send({destUser: destinationUser, fromUser: fromUser}); 
                    }).catch(err => {
                        if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                        return res.status(500).send({ message: "Error updating user in cancelAthleteCoachLink" });
                    });
                } else {
                    res.status(500).send({ message: "Error updating users in cancelAthleteCoachLink: link between athlete and coach does not exists." });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in cancelAthleteCoachLink" });
            });
    };

    function dismissAllNotifications(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "User not found" }); }

                destinationUser = dUser;
                let notificationToConsumeList = _.filter(destinationUser.notifications, function(n) { return !n.bConsumed; });
                
                // 1. Check if there are some notification to be consumed, and if yes, consume them (just consume all notifications that does not need confirmation, but only dismiss)
                if(notificationToConsumeList.length > 0) {
                    for(let i=0; i<destinationUser.notifications.length; i++) {
                        if(_.find(NOTIFICATION_ONLY_DISMISS, function(e) { return e == destinationUser.notifications[i].type; }) != undefined)
                            consumeAndCleanNotifications(destinationUser, destinationUser.notifications[i]._id)
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
                            if (!destinationUser) { return res.status(404).send({ message: "User not found" }); }

                            // Update destUser informations in destUser client
                            sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser clients
                            for(let j=0; j<notificationToConsumeList.length; j++) {
                                sendUpdatedUserToClientSocket(destinationUser, notificationToConsumeList[j].from);
                            }

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                            return res.status(500).send({ message: "Error updating user in dismissAllNotifications" });
                        });
                } else {
                    return res.status(500).send({ message: "Error updating user in dismissAllNotifications: there are no notification to dismiss." });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in dismissAllNotifications" });
            });
    }

    function cancelNotification(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "User not found" }); }

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
                            if (!destinationUser) { return res.status(404).send({ message: "User not found" }); }

                            // Update destUser informations in destUser client
                            sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser client
                            sendUpdatedUserToClientSocket(destinationUser, notificationToCancel.from);

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                            return res.status(500).send({ message: "Error updating user in cancelNotification" });
                        });
                } else {
                    return res.status(500).send({ message: "Error updating user in cancelNotification: notification to cancel not found." });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in cancelNotification" });
            });
    }

    function cancelAllNotifications(req, res, next) {
        let destinationUser;

        // Find destination user
        Promise.all([
            User.findOne({ _id: req.params._id })
        ])
            .then(([dUser]) => {
                if (!dUser) { return res.status(404).send({ message: "User not found" }); }

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
                            if (!destinationUser) { return res.status(404).send({ message: "User not found" }); }

                            // Update destUser informations in destUser client
                            sendUpdatedUserToItsSocket(destinationUser);    

                            // Update destUser informations in fromUser clients
                            for(let i=0; i<notificationToCancelList.length; i++) {
                                sendUpdatedUserToClientSocket(destinationUser, notificationToCancelList[i].from);
                            }

                            // Send response to calling client
                            res.send(destinationUser);                      
                        }).catch(err => {
                            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                            return res.status(500).send({ message: "Error updating user in cancelAllNotifications" });
                        });
                } else {
                    return res.status(500).send({ message: "Error updating user in cancelAllNotifications: there are no notification to cancel." });
                }
            }).catch(err => {
                if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                return res.status(500).send({ message: "Error updating user in cancelAllNotifications" });
            });
    }

    /** UTILS **/

    /**
     * This function is used whenever a notifications has to become consumed. 
     * This function set the notification to consumed and pop the notifications list in the user in order to mantain only MAX_NOTIFICATION_LIST_LENGTH consumed notifications
     */
    function consumeAndCleanNotifications(user, consumedNotId) {
        // Set the notification to consumed, if the notification exists
        let notificationToConsumeIndex = _.findIndex(user.notifications, function(n) { return n._id == consumedNotId; });
        if(notificationToConsumeIndex != -1) {
            user.notifications[notificationToConsumeIndex].bConsumed = true;

            // Split the notifications list in two arrays: one with consumed notifications, one with unconsumed notifications.
            let notConsumedNotifications = _.filter(user.notifications, function (n) { return !n.bConsumed });
            let consumedNotifications = _.filter(user.notifications, function (n) { return n.bConsumed });

            // Removes oldest consumed notifications in order to save only the MAX_NOTIFICATION_LIST_LENGTH recent ones
            if (consumedNotifications.lenght > MAX_NOTIFICATION_LIST_LENGTH) {
                let outBuffer = consumedNotifications.lenght - MAX_NOTIFICATION_LIST_LENGTH;
                _.orderBy(consumedNotifications, ['bConsumed', 'creationDate'], ['asc', 'desc']);

                for (let i = 0; i < outBuffer; i++) {
                    consumedNotifications.pop();
                }

                user.notifications = _.orderBy(notConsumedNotifications.concat(consumedNotifications), ['bConsumed', 'creationDate'], ['asc', 'desc']);
            }

            return true;
        } 
        else {
            return false;
        }
    }

    /**
     * Send user informations to destination client (if the client is online)
     * @param {*} user 
     */
    function sendUpdatedUserToItsSocket(user) {
        let userSocket = _.find(clientSocketList, function(socket) { return socket.userId == user._id});
        if(userSocket != undefined && userSocket.socketId) {
            io.to(userSocket.socketId).emit('userUpdated', user);
        }
    }

    /**
     * Used when a client needs to update an user in an userList (if the client is online)
     * @param {*} user 
     */
    function sendUpdatedUserToClientSocket(user, destClientUserId) {
        let userSocket = _.find(clientSocketList, function(socket) { return socket.userId == destClientUserId});
        if(userSocket != undefined && userSocket.socketId) {
            io.to(userSocket.socketId).emit('userListUserUpdated', user);
        }
    }

}