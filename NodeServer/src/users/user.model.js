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

const PRSeriesSchema = mongoose.Schema({
    seriesNumber: Number,
    repNumber: Number,
    weight: Number,
    measure: String,
    rest: Number,
    bCompetition: Boolean,
    bVerified: Boolean,
    bPublic: Boolean,
    comment: String
}, { _id: false})

const PersonalRecordSchema = mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: false
    },
    series: [PRSeriesSchema],
    oneRepPR: PRSeriesSchema,
    bPublic: Boolean
}, { _id: false})

const NotificationSchema = mongoose.Schema({
    type: { type: String, required: true },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    message: { type: String, required: true },
    bConsumed: { type: Boolean, required: false },
    creationDate: { type: Date, required: true }
})

const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    sex: { type: String, required: false },
    contacts: { type: ContactsSchema, required: false },
    residence: { type: ResidenceSchema, required: false },
    userType: { type: String, required: true },             // athlete, coach, both
    bodyWeight: Number,
    yearsOfExperience: Number,
    personalRecords: { type: [PersonalRecordSchema], required: false },
    notifications: { type: [NotificationSchema], required: false },
    coaches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
    athletes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }]
});

const userSchema =  mongoose.model('User', UserSchema);
const contactsSchema = mongoose.model('Contacts', ContactsSchema);
const residenceSchema = mongoose.model('Residence', ResidenceSchema);
const notificationSchema = mongoose.model('Notification', NotificationSchema);

module.exports = {User: userSchema, UserSchema: UserSchema, 
                  Contacts: contactsSchema, ContactsSchema: ContactsSchema, 
                  Residence: residenceSchema, ResidenceSchema: ResidenceSchema,
                  Notification: notificationSchema, NotificationSchema: NotificationSchema
                };
