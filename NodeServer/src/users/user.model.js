const mongoose = require('mongoose');

const ContactsSchema = mongoose.Schema({
    email: String,
    telephone: String
}, { _id: false})

const ResidenceSchema = mongoose.Schema({
    state: String,
    city: String,
    address: String
}, { _id: false})

const UserSchema = mongoose.Schema({
    name: String,
    surname: String,
    dateOfBirth: Date,
    sex: String,
    bodyWeight: Number,
    userType: String,
    yearsOfExperience: Number,
    contacts: ContactsSchema,
    residence: ResidenceSchema
}, {
    timestamps: true
});

const userSchema =  mongoose.model('User', UserSchema);
module.exports = {User: userSchema, UserSchema: UserSchema};
