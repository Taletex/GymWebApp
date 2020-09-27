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
    name: { type: String, required: true },
    surname: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    sex: { type: String, required: false },
    contacts: { type: ContactsSchema, required: false },
    residence: { type: ResidenceSchema, required: false },
    userType: { type: String, required: true },             // athlete, coach, both
    bodyWeight: Number,
    yearsOfExperience: Number
});

const userSchema =  mongoose.model('User', UserSchema);
const contactsSchema = mongoose.model('Contacts', ContactsSchema);
const residenceSchema = mongoose.model('Residence', ResidenceSchema);

module.exports = {User: userSchema, UserSchema: UserSchema, Contacts: contactsSchema, ContactsSchema: ContactsSchema, Residence: residenceSchema, ResidenceSchema: ResidenceSchema};
