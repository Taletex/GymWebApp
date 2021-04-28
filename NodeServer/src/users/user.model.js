const { number } = require('joi');
const mongoose = require('mongoose');

const SocialsSchema = mongoose.Schema ({
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    other: String,
}, { _id: false})

const ContactsSchema = mongoose.Schema({
    email: String,
    telephone: String,
    socials: { type: SocialsSchema, required: false }
}, { _id: false})

const ResidenceSchema = mongoose.Schema({
    state: String,
    province: String,
    cap: String,
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

const UserSettingsSchema = mongoose.Schema({
    showActivities: Number,
    showPrivateInfo: Number,
    showPublicInfo: Number
}, { _id: false})

const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    placeOfBirth: { type: ResidenceSchema, required: false },
    sex: { type: String, required: false },
    userType: { type: String, required: true },             // athlete, coach, both
    bodyWeight: Number,
    yearsOfExperience: Number,
    disciplines: { type: [String], required: false },
    gyms: { type: [String], required: false },
    coaches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
    athletes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
    personalRecords: { type: [PersonalRecordSchema], required: false },
    contacts: { type: ContactsSchema, required: false },
    residence: { type: ResidenceSchema, required: false },
    biography: String,
    profilePicture: String,
    notifications: { type: [NotificationSchema], required: false },
    settings: { type: UserSettingsSchema, required: false }
});

const userSchema =  mongoose.model('User', UserSchema);
const contactsSchema = mongoose.model('Contacts', ContactsSchema);
const residenceSchema = mongoose.model('Residence', ResidenceSchema);
const notificationSchema = mongoose.model('Notification', NotificationSchema);
const userSettingsSchema = mongoose.model('UserSettings', UserSettingsSchema);
const socialsSchema = mongoose.model('Socials', SocialsSchema);

module.exports = {User: userSchema, UserSchema: UserSchema, 
                  Contacts: contactsSchema, ContactsSchema: ContactsSchema, 
                  Residence: residenceSchema, ResidenceSchema: ResidenceSchema,
                  Notification: notificationSchema, NotificationSchema: NotificationSchema,
                  UserSettings: userSettingsSchema, UserSettingsSchema: UserSettingsSchema,
                  SocialsSchema: socialsSchema, SocialsSchema: SocialsSchema
                };
