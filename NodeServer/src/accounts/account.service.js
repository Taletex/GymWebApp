﻿const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const email = require('src/_helpers/send-email');
const db = require('src/_helpers/db');
const Role = require('src/_helpers/role');
const _ = require('lodash');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.findOne({ email }).populate('user')
                                                       .populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                                       .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}}})
                                                       .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'destination'}}})
                                                       .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'});

    if (!account || !account.isVerified || !bcrypt.compareSync(password, account.passwordHash)) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { account } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

// When register the account, creates also the associated user
async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ email: params.email }).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                                        .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
                                                        .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
                                                        .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'})) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create user object to be associated to the account object
    const user = new db.User({
        bodyWeight: 0,
        userType: params.userType,
        yearsOfExperience: 0,
        name: params.name,
        surname: params.surname,
        dateOfBirth: new Date(),
        sex: "M",
        contacts: new db.Contacts({email: params.email, telephone: ''}),
        residence: new db.Residence({state: '', city: '', address: ''}),
        personalRecords: []
    });

    const data = await user.save()

    // create account object
    delete params.bodyWeight;
    delete params.userType;
    delete params.yearsOfExperience;
    delete params.name;
    delete params.surname;
    delete params.dateOfBirth;
    delete params.sex;
    delete params.contacts;
    delete params.residence;
    params.user = data._id;

    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.countDocuments({})) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    // send email
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ verificationToken: token }).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                                                          .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
                                                                          .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
                                                                          .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'});

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = undefined;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ email }).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                                       .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
                                                       .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
                                                       .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'});


    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 24*60*60*1000)
    };
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    }).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
      .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
      .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
      .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'});

    if (!account) throw 'Invalid token';
}

async function resetPassword({ token, password }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    }).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
      .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
      .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
      .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'});


    if (!account) throw 'Invalid token';

    // update password and remove reset token
    account.passwordHash = hash(password);
    account.passwordReset = Date.now();
    account.resetToken = undefined;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.find().populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                            .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
                                            .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
                                            .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'});

    return _.sortBy(accounts.map(x => basicDetails(x)), ['user.name', 'usern.surname', 'email']);
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ email: params.email }).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                                            .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
                                                            .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
                                                            .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'})) {
        throw 'Email "' + params.email + '" is already registered';
    }

    // create user object to be associated to the account object
    const user = new db.User({
        bodyWeight: 0,
        userType: params.userType,
        yearsOfExperience: 0,
        name: params.name,
        surname: params.surname,
        dateOfBirth: new Date(),
        sex: "M",
        contacts: new db.Contacts({email: params.email, telephone: ''}),
        residence: new db.Residence({state: '', city: '', address: ''}),
        personalRecords: []
    });

    const data = await user.save()

    // create account object
    delete params.bodyWeight;
    delete params.userType;
    delete params.yearsOfExperience;
    delete params.name;
    delete params.surname;
    delete params.dateOfBirth;
    delete params.sex;
    delete params.contacts;
    delete params.residence;
    params.user = data._id;

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate
    if (account.email !== params.email && await db.Account.findOne({ email: params.email }).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                                                                            .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
                                                                                            .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
                                                                                            .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'})) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = hash(params.password);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    const user = await getUser(account.user._id);

    await account.remove();
    await user.remove();
}

// helper functions

async function getAccount(id) {
    if (!db.isValidId(id)) throw 'Account not found';
    const account = await db.Account.findById(id).populate({ path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}})
                                                 .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'from'}}})
                                                 .populate({ path: 'user', populate: {path: 'notifications', populate: {path: 'from'}, populate: {path: 'destination'}}})
                                                 .populate({ path: 'user', populate: 'coaches'}).populate({ path: 'user', populate: 'athletes'});

    if (!account) throw 'Account not found';
    return account;
}

async function getUser(id) {
    if (!db.isValidId(id)) throw 'Account not found';
    const user = await db.User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate({path: 'account', populate: { path: 'user', populate: {path: 'personalRecords', populate: {path: 'exercise'}}}})
                                                                 .populate({path: 'account', populate: { path: 'user', populate: {path: 'notifications', populate: {path: 'from'}}}})
                                                                 .populate({path: 'account', populate: { path: 'user', populate: {path: 'notifications', populate: {path: 'destination'}}}})
                                                                 .populate({path: 'account', populate: { path: 'user', populate: 'coaches'}}).populate({path: 'account', populate: { path: 'user', populate: 'athletes'}});
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function hash(password) {
    return bcrypt.hashSync(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        account: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, email, role, created, updated, isVerified, user } = account;
    return { id, email, role, created, updated, isVerified, user };
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await email.sendEmail({
        to: account.email,
        subject: 'MyTrainingPlatform - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await email.sendEmail({
        to: email,
        subject: 'MyTrainingPlatform - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken.token}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken.token}</code></p>`;
    }

    await email.sendEmail({
        to: account.email,
        subject: 'MyTrainingPlatform - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}