﻿const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('src/_middleware/validate-request');
const authorize = require('src/_middleware/authorize')
const Role = require('src/_helpers/role');
const accountService = require('./account.service');
const { ACCOUNT_VALIDATORS, USER_TYPES } = require('../_helpers/enum');
const generalService = require('../_helpers/general.service')();

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.get('/user/:id', authorize(), getAccountByUserId)
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().max(ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH).required(),
        password: Joi.string().min(ACCOUNT_VALIDATORS.MIN_PSW_LENGTH).max(ACCOUNT_VALIDATORS.MAX_PSW_LENGTH).required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: "TOKEN_REQUIRED" });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: "TOKEN_REVOKED" }))
        .catch(next);
}

// Note: only during registration I need also user information (to create the user associated with the account)
function registerSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().min(0).max(ACCOUNT_VALIDATORS.MAX_NAME_LENGTH).required(),                  
        surname: Joi.string().min(0).max(ACCOUNT_VALIDATORS.MAX_SURNAME_LENGTH).required(),              
        userType: Joi.string().valid(USER_TYPES.BOTH, USER_TYPES.ATHLETE, USER_TYPES.COACH).required(),             
        email: Joi.string().email().max(ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH).required(),
        password: Joi.string().min(ACCOUNT_VALIDATORS.MIN_PSW_LENGTH).max(ACCOUNT_VALIDATORS.MAX_PSW_LENGTH).required(),
        confirmPassword: Joi.string().min(ACCOUNT_VALIDATORS.MIN_PSW_LENGTH).max(ACCOUNT_VALIDATORS.MAX_PSW_LENGTH).valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    accountService.register(req.body, req.get('origin'))
        .then(() => res.json({ message: "REGISTER_SUCCESS" }))
        .catch(next);
}

function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
    accountService.verifyEmail(req.body)
        .then(() => res.json({ message: "VERIFICATION_SUCCESS" }))
        .catch(next);
}

function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().max(ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH).required().required()
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: "FORGOT_PASSWORD" }))
        .catch(next);
}

function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: "TOKEN_VALID" }))
        .catch(next);
}

function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(ACCOUNT_VALIDATORS.MIN_PSW_LENGTH).max(ACCOUNT_VALIDATORS.MAX_PSW_LENGTH).required(),
        confirmPassword: Joi.string().min(ACCOUNT_VALIDATORS.MIN_PSW_LENGTH).max(ACCOUNT_VALIDATORS.MAX_PSW_LENGTH).valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
    accountService.resetPassword(req.body)
        .then(() => res.json({ message: "PASSWORD_RESET_SUCCESS" }))
        .catch(next);
}

function getAll(req, res, next) {
    accountService.getAll()
        .then(accounts => res.json(accounts))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account (note: req is an object containing 'user' which is an account object)
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    accountService.getById(req.params.id)
        .then((account) => {
            if(account) {
                generalService.filterUserByPrivacySettings([account.user], req.user);
                res.json(account);
            } else {
                res.sendStatus(404)
            }
        })
        .catch(next);
}

function getAccountByUserId(req, res, next) {
    // only admins can use this rest (note: req is an object containing 'user' which is an account object)
    if (req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    accountService.getAccountByUserId(req.params.id)
        .then((account) => {
            if(account) {
                generalService.filterUserByPrivacySettings([account.user], req.user);
                res.json(account);
            } else {
                res.sendStatus(404)
            }
        })
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().min(0).max(ACCOUNT_VALIDATORS.MAX_NAME_LENGTH).required(),                  
        surname: Joi.string().min(0).max(ACCOUNT_VALIDATORS.MAX_SURNAME_LENGTH).required(),              
        userType: Joi.string().valid(USER_TYPES.BOTH, USER_TYPES.ATHLETE, USER_TYPES.COACH).required(),             
        email: Joi.string().email().max(ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH).required(),
        password: Joi.string().min(ACCOUNT_VALIDATORS.MIN_PSW_LENGTH).max(ACCOUNT_VALIDATORS.MAX_PSW_LENGTH).required(),
        confirmPassword: Joi.string().min(ACCOUNT_VALIDATORS.MIN_PSW_LENGTH).max(ACCOUNT_VALIDATORS.MAX_PSW_LENGTH).valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    accountService.create(req.body)
        .then(account => res.json(account))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    // users can update their own account and admins can update any account
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    accountService.update(req.params.id, req.body)
        .then(account => res.json(account))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own account and admins can delete any account
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    accountService.delete(req.params.id)
        .then(() => res.json({ message: "ACCOUNT_DELETE_SUCCESS" }))
        .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}