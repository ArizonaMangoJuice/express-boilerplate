const express = require('express');
const router = express.Router();
const User = require('../models/user'); 

router.post('/', (req, res, next) => {
    const {username, password} = req.body;

    if(password.length < 10){
        const err = new Error('password is too short');
        err.status = 401;
        err.location = 'password';
        return next(err);
    }

    if(username.length === 0){
        const err = new Error('username is too short');
        err.status = 401;
        err.location = 'username';
        return next(err);
    }

    let newUser = {};

    User.hashPassword(password) //grabs pass and hashes it 
        .then(digest => {
            newUser = {
                username,
                password: digest
            }

            return User.create(newUser); // returns user with hashed pass
        })
        .then(result => {
            res.status(201)
                .location(`${req.originalUrl}/${result.id}`)
                .json(result);
        })
        .catch(err => {
            if(err.code === 11000){
                err = new Error('The username already exists');
                err.reason = 'ValidationError';
                err.status = 401;
                err.location = 'username';
            }

            next(err);
        });
});

module.exports = router;