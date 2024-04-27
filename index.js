const express = require('express');
const session = require('express-session');
const publicPages = require('./routes/publicPages');
const profilePages = require('./routes/profilePages');
const adminPages = require('./routes/adminPages');
const authMiddleware = require('./middlewares/authMiddleware');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
require('dotenv').config();

// Set the port from the environment variables or use a default value
const port = process.env.PORT || 3000;

const app = express();

// create a rotating write stream
var accessLogStream = rfs.createStream('morgan-access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'logs')
})

// handle sessions
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

// Serve static files from the assets directory
app.use(express.static('assets'));

// Set the view engine to pug
app.set('view engine', 'pug');

// Set the isAuthenticated variable
app.use(authMiddleware.globalAuthVariables);

// setup the logger
app.use(morgan('combined')); // console
app.use(morgan('combined', { stream: accessLogStream })); // file

// Routes
app.use('/', publicPages);
app.use('/profile', profilePages);
app.use('/admin', adminPages);

// Error handling
app.use((req, res, next) => {
    res.status(404).render('404');
});

app.use((req, res, next) => {
    res.status(500).render('500');
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});