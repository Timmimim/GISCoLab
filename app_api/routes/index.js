/**
 * Created by tija on 04.12.16.
 */

// TODO: create own controllers and link them in

var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});

/**
 router.get('/path', controllerPath.action);
 **/