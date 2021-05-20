const { number } = require('joi');
const mongoose = require('mongoose');


const SocialsSchema = mongoose.Schema ({
    facebook: { type: String, required: false, default: "" },
    twitter: { type: String, required: false, default: "" },
    instagram: { type: String, required: false, default: "" },
    linkedin: { type: String, required: false, default: "" },
    other: { type: String, required: false, default: "" },
}, { _id: false})
const socialsSchema = mongoose.model('Socials', SocialsSchema);


const ContactsSchema = mongoose.Schema({
    email: { type: String, required: false, default: "" },
    telephone: { type: String, required: false, default: "" },
    socials: { type: SocialsSchema, required: false, default: new socialsSchema() },
}, { _id: false})
const contactsSchema = mongoose.model('Contacts', ContactsSchema);


const ResidenceSchema = mongoose.Schema({
    state: { type: String, required: false, default: "" },
    province: { type: String, required: false, default: "" },
    cap: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    address: { type: String, required: false, default: "" }
}, { _id: false})
const residenceSchema = mongoose.model('Residence', ResidenceSchema);


const PRSeriesSchema = mongoose.Schema({
    seriesNumber: { type: Number, required: false, default: 1 },
    repNumber: { type: Number, required: false, default: 1 },
    weight: { type: Number, required: false, default: 1 },
    measure: { type: String, required: false, default: "kg" },
    rest: { type: Number, required: false, default: 90 },
    bCompetition: { type: Boolean, required: false, default: false },
    bVerified: { type: Boolean, required: false, default: false },
    bPublic: { type: Boolean, required: false, default: false },
    comment: { type: String, required: false, default: "" }
}, { _id: false})
const pRSeriesSchema = mongoose.model('PRSeries', PRSeriesSchema);


const PersonalRecordSchema = mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: false
    },
    series: { type: [PRSeriesSchema], default: [] },
    oneRepPR: { type: PRSeriesSchema, default: new pRSeriesSchema() },
    bPublic: { type: Boolean, required: false, default: false }
}, { _id: false})
const personalRecordSchema = mongoose.model('PersonalRecord', PersonalRecordSchema);


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
    bConsumed: { type: Boolean, required: false, default: false },
    creationDate: { type: Date, required: true, default: new Date() }
})
const notificationSchema = mongoose.model('Notification', NotificationSchema);


const UserSettingsSchema = mongoose.Schema({
    showActivities: { type: Number, required: true, default: 0 },
    showPrivateInfo: { type: Number, required: true, default: 0 },
    showPublicInfo: { type: Number, required: true, default: 0 }
}, { _id: false})
const userSettingsSchema = mongoose.model('UserSettings', UserSettingsSchema);


const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    dateOfBirth: { type: Date, required: false, default: new Date() },
    placeOfBirth: { type: ResidenceSchema, required: false, default: new residenceSchema() },
    sex: { type: String, required: false, default: 'M' },
    userType: { type: String, required: true, default: 'athlete' },             // athlete, coach, both
    bodyWeight: { type: Number, required: false, default: 50 },
    yearsOfExperience: { type: Number, required: false, default: 0 },
    disciplines: { type: [String], required: false, default: [] },
    gyms: { type: [String], required: false, default: [] },
    coaches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: []
    }],
    athletes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: []
    }],
    personalRecords: { type: [PersonalRecordSchema], required: false, default: [] },
    contacts: { type: ContactsSchema, required: false, default: new contactsSchema() },
    residence: { type: ResidenceSchema, required: false, default: new residenceSchema() },
    biography: { type: String, required: false, default: '' },
    profilePicture: { type: String, required: false, default: '' },
    notifications: { type: [NotificationSchema], required: false, default: [] },
    settings: { type: UserSettingsSchema, required: true, default: new userSettingsSchema() }
});
const userSchema =  mongoose.model('User', UserSchema);


module.exports = {User: userSchema, UserSchema: UserSchema, 
                  Contacts: contactsSchema, ContactsSchema: ContactsSchema, 
                  Residence: residenceSchema, ResidenceSchema: ResidenceSchema,
                  Notification: notificationSchema, NotificationSchema: NotificationSchema,
                  UserSettings: userSettingsSchema, UserSettingsSchema: UserSettingsSchema,
                  SocialsSchema: socialsSchema, SocialsSchema: SocialsSchema
                };
