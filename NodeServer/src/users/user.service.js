const { User, Notification } = require('src/users/user.model.js');
const _ = require('lodash');
const { NotificationSchema } = require('./user.model');
const { concat } = require('lodash');
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

/** REST CALLBACKS **/

// Create and Save a new User
exports.createUser = (req, res) => {
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
exports.findAllUser = (req, res) => {
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
exports.findAllAthlete = (req, res) => {
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
exports.findAllCoaches = (req, res) => {
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
exports.findOneUser = (req, res) => {
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
exports.updateUser = (req, res) => {
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
        notifications: _.sortBy(req.body.notifications, ['bConsumed', 'creationDate']),
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
exports.deleteUser = (req, res) => {
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
exports.sendNotification = (req, res) => {
    // Validate request
    if (!req.body) { return res.status(400).send({ message: "Notification content can not be empty" }); }

    Promise.all([
        User.findOne({ _id: req.params._id })
    ])
        .then(([dUser]) => {
            if (!dUser) { return res.status(404).send({ message: "User not found" }); }

            destinationUser = dUser;
            destinationUser.notifications.push(req.body);

            // Find user and update it with the request body
            User.findOneAndUpdate({ _id: req.params._id }, {
                notifications: _.sortBy(destinationUser.notifications, ['bConsumed', 'creationDate'])
            }, { new: true })
                .then(user => {
                    if (!user) { return res.status(404).send({ message: "User not found with id " + req.params._id }); }

                    // Returns the user (the user who sent this request) update by finding it in the database
                    User.find({ _id: user._id }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                                .populate({path: 'notifications', populate: {path: 'from'}})
                                                .populate({path: 'notifications', populate: {path: 'destination'}})
                                                .populate('coaches').populate('athletes')
                        .then(users => {
                            res.send(users[0]);
                        })
                }).catch(err => {
                    if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found with id " + req.params._id }); }
                    return res.status(500).send({ message: "Error updating user with id " + req.params._id });
                });
        }).catch(err => {
            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
            return res.status(500).send({ message: "Error updating user in accept notification" });
        });
};

// Accept a notification for a given User
exports.acceptNotification = (req, res) => {
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
            consumeAndCleanNotifications(destinationUser, req.params._notId);

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
                    notifications: _.sortBy(destinationUser.notifications, ['bConsumed', 'creationDate']),
                    coaches: destinationUser.coaches,
                    athletes: destinationUser.athletes
                }, { new: true }),
                User.findOneAndUpdate({ _id: fromUser._id }, {
                    notifications: _.sortBy(fromUser.notifications, ['bConsumed', 'creationDate']),
                    coaches: fromUser.coaches,
                    athletes: fromUser.athletes
                }, { new: true })
            ])
                .then(([destinationUser, fromUser]) => {
                    if (!destinationUser || !fromUser) { return res.status(404).send({ message: "User not found" }); }

                    // Returns the destinationUser (the user who sent this request) updated by finding it in the database
                    User.find({ _id: destinationUser._id }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                                           .populate({path: 'notifications', populate: {path: 'from'}})
                                                           .populate({path: 'notifications', populate: {path: 'destination'}})
                                                           .populate('coaches').populate('athletes')
                        .then(users => {
                            res.send(users[0]);
                        })
                }).catch(err => {
                    if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                    return res.status(500).send({ message: "Error updating user in accept notification" });
                });


        }).catch(err => {
            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
            return res.status(500).send({ message: "Error updating user in accept notification" });
        });
};

exports.refuseNotification = (req, res) => {
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
            consumeAndCleanNotifications(destinationUser, req.params._notId);

            // 2. add a notification to the from user (to inform about the refused request)
            let message = "L'utente " + destinationUser.name + " " + destinationUser.surname + " ha RIFIUTATO la richiesta di " + (notification.type == NOTIFICATION_TYPE.COACH_REQUEST ? "seguirti come coach" : (notification.type == NOTIFICATION_TYPE.ATHLETE_REQUEST ? 'essere seguito come atleta' : ''));
            fromUser.notifications.push(new Notification({ type: NOTIFICATION_TYPE.REQUEST_REFUSED, from: destinationUser._id, destination: fromUser._id, message: message, bConsumed: false, creationDate: new Date() }));

            // 3. update from and destination users
            Promise.all([
                User.findOneAndUpdate({ _id: destinationUser._id }, {
                    notifications: _.sortBy(destinationUser.notifications, ['bConsumed', 'creationDate']),
                    coaches: destinationUser.coaches,
                    athletes: destinationUser.athletes
                }, { new: true }),
                User.findOneAndUpdate({ _id: fromUser._id }, {
                    notifications: _.sortBy(fromUser.notifications, ['bConsumed', 'creationDate']),
                    coaches: fromUser.coaches,
                    athletes: fromUser.athletes
                }, { new: true })
            ])
                .then(([destinationUser, fromUser]) => {
                    if (!destinationUser || !fromUser) { return res.status(404).send({ message: "User not found" }); }

                    // Returns the destinationUser (the user who sent this request) updated by finding it in the database
                    User.find({ _id: destinationUser._id }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                                            .populate({path: 'notifications', populate: {path: 'from'}})
                                                            .populate({path: 'notifications', populate: {path: 'destination'}})
                                                            .populate('coaches').populate('athletes')
                        .then(users => {
                            res.send(users[0]);
                        })
                }).catch(err => {
                    if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                    return res.status(500).send({ message: "Error updating user in accept notification" });
                });


        }).catch(err => {
            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
            return res.status(500).send({ message: "Error updating user in accept notification" });
        });
};

exports.dismissNotification = (req, res) => {
    let destinationUser;

    // Find destination user
    Promise.all([
        User.findOne({ _id: req.params._id })
    ])
        .then(([dUser]) => {
            if (!dUser) { return res.status(404).send({ message: "User not found" }); }

            destinationUser = dUser;

            // 1. in destination user set the notification as consumed and pop exceeded elements in the notifications list
            consumeAndCleanNotifications(destinationUser, req.params._notId);

            // 2. update destination user
            Promise.all([
                User.findOneAndUpdate({ _id: destinationUser._id }, {
                    notifications: _.sortBy(destinationUser.notifications, ['bConsumed', 'creationDate']),
                    coaches: destinationUser.coaches,
                    athletes: destinationUser.athletes
                }, { new: true })
            ])
                .then(([destinationUser]) => {
                    if (!destinationUser) { return res.status(404).send({ message: "User not found" }); }

                    // Returns the destinationUser (the user who sent this request) updated by finding it in the database
                    User.find({ _id: destinationUser._id }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                                            .populate({path: 'notifications', populate: {path: 'from'}})
                                                            .populate({path: 'notifications', populate: {path: 'destination'}})
                                                            .populate('coaches').populate('athletes')
                        .then(users => {
                            res.send(users[0]);
                        })
                }).catch(err => {
                    if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                    return res.status(500).send({ message: "Error updating user in accept notification" });
                });

        }).catch(err => {
            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
            return res.status(500).send({ message: "Error updating user in accept notification" });
        });
};

/**
 * cancelAthleteCoachLink
 * @param {*} userId
 */
exports.cancelAthleteCoachLink = (req, res) => {
    // Validate request
    if (!req.body) { return res.status(400).send({ message: "Notification content can not be empty" }); }

    let notification = req.body;
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

            // 2. Cancel the link between athlete and coach
            _.remove(coachUser.athletes, function(a) { a == athleteUser._id });
            _.remove(athleteUser.coaches, function(c) { c == coachUser._id });

            // 3. Add a notification in coach and athlete to notify them about the link cancellation
            coachUser.notifications.push(notification);
            athleteUser.notifications.push(notification);

            // 4. Find and update coach and athlete in the database
            
            Promise.all([
                User.findOneAndUpdate({ _id: coachUser._id }, {
                    notifications: _.sortBy(coachUser.notifications, ['bConsumed', 'creationDate']),
                    coaches: coachUser.coaches,
                    athletes: coachUser.athletes
                }, { new: true }),
                User.findOneAndUpdate({ _id: athleteUser._id }, {
                    notifications: _.sortBy(athleteUser.notifications, ['bConsumed', 'creationDate']),
                    coaches: athleteUser.coaches,
                    athletes: athleteUser.athletes
                }, { new: true })
            ])
                .then(([cUser, aUser]) => {
                    if (!cUser || !aUser) { return res.status(404).send({ message: "User not found" }); }

                    let fromUser = (cUser._id == notification.from ? cUser : aUser);
                    // Returns the fromUser (the user who sent this request) updated by finding it in the database
                    User.find({ _id: fromUser._id }).populate({path: 'personalRecords', populate: {path: 'exercise'}})
                                                    .populate({path: 'notifications', populate: {path: 'from'}})
                                                    .populate({path: 'notifications', populate: {path: 'destination'}})
                                                    .populate('coaches').populate('athletes')
                        .then(users => {
                            res.send(users[0]);
                        })
                }).catch(err => {
                    if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
                    return res.status(500).send({ message: "Error updating user in accept notification" });
                });
            
        }).catch(err => {
            if (err.kind === 'ObjectId') { return res.status(404).send({ message: "User not found" }); }
            return res.status(500).send({ message: "Error updating user in accept notification" });
        });
};



/** UTILS **/

/**
 * consumeAndCleanNotifications
 * This function is used whenever a notifications has to become consumed. 
 * This function set the notification to consumed and pop the notifications list in the user in order to mantain only MAX_NOTIFICATION_LIST_LENGTH consumed notifications
 */
function consumeAndCleanNotifications(user, consumedNotId) {
    // Set the notification to consumed
    (_.find(user.notifications, function (n) { return (n.type + "_" + n.from != consumedNotId); })).bConsumed = true;

    // Split the notifications list in two arrays: one with consumed notifications, one with unconsumed notifications.
    let notConsumedNotifications = _.filter(user.notifications, function (n) { return !n.bConsumed });
    let consumedNotifications = _.filter(user.notifications, function (n) { return n.bConsumed });

    // Removes oldest consumed notifications in order to save only the MAX_NOTIFICATION_LIST_LENGTH recent ones
    if (consumedNotifications.lenght > MAX_NOTIFICATION_LIST_LENGTH) {
        let outBuffer = consumedNotifications.lenght - MAX_NOTIFICATION_LIST_LENGTH;
        _.sortBy(consumedNotifications, ['bConsumed', 'creationDate']);

        for (let i = 0; i < outBuffer; i++) {
            consumedNotifications.pop();
        }

        user.notifications = _.sortBy(notConsumedNotifications.concat(consumedNotifications), ['bConsumed', 'creationDate']);
    }
}