require('rootpath')();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('src/_middleware/error-handler');

// create express app
const app = express();  

// parse application/x-www-form-urlencoded, application/json, cookie
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json())                          
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));


// api routes
app.get('/', (req, res) => { res.json({"message": "Welcome to GymWebApp database application."}); });
app.use('/trainings', require('src/trainings/training.controller'));
app.use('/exercises', require('src/exercises/exercise.controller'));
app.use('/users', require('src/users/user.controller'));

// swagger docs route
app.use('/api-docs', require('src/_helpers/swagger'));

// global error handler
app.use(errorHandler);

/* 
// Configuring the database
const dbConfig = {url: "mongodb://" + ( (process.argv[2] != undefined && process.argv[2] != null && process.argv[2] != "") ? process.argv[2] : appConfig.database.ip) + ":" + appConfig.database.port + "/" + appConfig.database.dbname};
console.log("Database address: " + dbConfig.url);
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true})
.then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
}); 


// listen for requests
app.listen(3000, () => {
    console.log("Database server is listening on port 3000");
});
*/

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});