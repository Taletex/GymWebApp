const cors = require('cors');
const express = require('express');
const router = express.Router();
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 


const userService = require('src/users/user.service.js');

/* ROUTES */

// Create a new User
router.post('/', userService.createUser);

// Retrieve all User
router.get('/', userService.findAllUser);

// Retrieve all Athletes
router.get('/athletes', userService.findAllAthlete);

// Retrieve all Coaches
router.get('/coaches', userService.findAllCoaches);

// Retrieve a single User with id
router.get('/:_id', userService.findOneUser);

// Update a User with id
router.put('/:_id', userService.updateUser);

// Delete a User with id
router.delete('/:_id', userService.deleteUser);

// Add a notification to a given User
router.post('/:_id/notifications', userService.sendNotification);

// Accept a notification for a given User
router.get('/:_id/notifications/:_notId/accept', userService.acceptNotification);

// Refuse a notification for a given User
router.get('/:_id/notifications/:_notId/refuse', userService.refuseNotification);

// Dismiss a notification for a given User
router.get('/:_id/notifications/:_notId/dismiss', userService.dismissNotification);




module.exports = router;