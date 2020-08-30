const cors = require('cors');
const express = require('express');
const router = express.Router();
const corsOptions = {origin: '*', optionsSuccessStatus: 200}; 


const userService = require('src/users/user.service.js');
router.options('*', cors(corsOptions)) // enable pre-flight request for all requests

/* ROUTES */

// Create a new User
router.post('/', cors(corsOptions), userService.createUser);

// Retrieve all User
router.get('/', cors(corsOptions), userService.findAllUser);

// Retrieve all User
router.get('/athletes', cors(corsOptions), userService.findAllAthlete);

// Retrieve a single User with id
router.get('/:_id', cors(corsOptions), userService.findOneUser);

// Update a User with id
router.put('/:_id', cors(corsOptions), cors(corsOptions), userService.updateUser);

// Delete a User with id
router.delete('/:_id', cors(corsOptions), userService.deleteUser);

module.exports = router;