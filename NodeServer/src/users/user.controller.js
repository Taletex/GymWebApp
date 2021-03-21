
module.exports = function(io, clientSocketList) {
    
    const cors = require('cors');
    const express = require('express');
    const router = express.Router();
    const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 
    const userService = require('src/users/user.service')(io, clientSocketList);

    /* ROUTES */
    // Create a new User
    router.post('/', (req, res, next) => {userService.createUser(req, res, next)});

    // Retrieve all User
    router.get('/', (req, res, next) => {userService.findAllUser(req, res, next)});

    // Retrieve all Athletes
    router.get('/athletes', (req, res, next) => {userService.findAllAthlete(req, res, next)});

    // Retrieve all Coaches
    router.get('/coaches', (req, res, next) => {userService.findAllCoaches(req, res, next)});

    // Retrieve a single User with id
    router.get('/:_id', (req, res, next) => {userService.findOneUser(req, res, next)});

    // Update a User with id
    router.put('/:_id', (req, res, next) => {userService.updateUser(req, res, next)});

    // Delete a User with id
    router.delete('/:_id', (req, res, next) => {userService.deleteUser(req, res, next)});

    // Add a notification to a given User
    router.put('/:_id/notifications', (req, res, next) => {userService.sendNotification(req, res, next)});

    // Accept a notification for a given User
    router.put('/:_id/notifications/:_notId/accept', (req, res, next) => {userService.acceptNotification(req, res, next)});

    // Refuse a notification for a given User
    router.put('/:_id/notifications/:_notId/refuse', (req, res, next) => {userService.refuseNotification(req, res, next)});

    // Cancel a link beteen coach and athlete
    router.put('/:_id/notifications/cancelLink', (req, res, next) => {userService.cancelAthleteCoachLink(req, res, next)});

    // Dismiss a notification for a given User
    router.put('/:_id/notifications/:_notId/dismiss', (req, res, next) => {userService.dismissNotification(req, res, next)});

    // Dismiss all notifications for a given User
    router.put('/:_id/notifications/dismissAll', (req, res, next) => {userService.dismissAllNotifications(req, res, next)});

    // Cancel a notification for a given User
    router.put('/:_id/notifications/:_notId/cancel', (req, res, next) => {userService.cancelNotification(req, res, next)});

    // Cancel all notifications for a given User
    router.put('/:_id/notifications/cancelAll', (req, res, next) => {userService.cancelAllNotifications(req, res, next)});

    return router;
}