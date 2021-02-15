const config = require('config.json');
const mongoose = require('mongoose');
const {User} = require('src/users/user.model.js');
const {Contacts} = require('src/users/user.model.js');
const {Residence} = require('src/users/user.model.js');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind( console, 'Database Connection Error!' ));
db.once('open', function() {
    console.log.bind( console, 'Database Connection Succeed!' );

    let Exercise = (require('src/exercises/exercise.model')).Exercise;
    Exercise.countDocuments({creator: null}, function(err, c) {
        if(c===0)
            initExercisesCollection();
    });

});

module.exports = {
    Account: require('src/accounts/account.model'),
    User: User,
    Contacts: Contacts,
    Residence: Residence,
    RefreshToken: require('src/accounts/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function initExercisesCollection() {
    let Exercise = mongoose.model('Exercise');
    let exerciseJson = require("src/_jsons/exercises.json")

    Exercise.find({creator: null}).remove();                               // Reset the exercise collection

    for(let i=0; i<exerciseJson.length; i++) {
        new Exercise(exerciseJson[i]).save();
    }
}