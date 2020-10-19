const config = require('config.json');
const mongoose = require('mongoose');
const {User} = require('src/users/user.model.js');
const {Contacts} = require('src/users/user.model.js');
const {Residence} = require('src/users/user.model.js');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

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