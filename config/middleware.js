const express = require('express');
const Sequelize = require("sequelize");
const session = require('express-session');
const authMiddleware = require('../middlewares/authMiddleware');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');

require('dotenv').config();

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Set up session
    const SequelizeStore = require("connect-session-sequelize")(session.Store);
    const sequelize = new Sequelize({ dialect: 'sqlite', storage: path.join(__dirname, 'database', 'session.sqlite') })
    const sessionStore = new SequelizeStore({ db: sequelize });
    app.use(session({ secret: process.env.SESSION_SECRET, store: sessionStore, resave: false, saveUninitialized: false, proxy: true }));
    // initialize database if needed
    sessionStore.sync();

    // Serve static files
    app.use(express.static('assets'));

    // Set the view engine to pug
    app.set('view engine', 'pug');

    // Set the isAuthenticated variable
    app.use(authMiddleware.globalAuthVariables);

    // Setup the logger
    const accessLogStream = rfs.createStream('morgan-access.log', {
        interval: '1d', // rotate daily
        path: path.join(__dirname, 'logs')
    })
    app.use(morgan('combined')); // console
    app.use(morgan('combined', { stream: accessLogStream })); // file
};