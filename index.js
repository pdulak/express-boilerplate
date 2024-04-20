const express = require('express');
const session = require('express-session');
const publicPages = require('./routes/publicPages');
const profilePages = require('./routes/profilePages');
const sequelize = require('sequelize');
const logger = require('./tools/logger');
const morgan = require('morgan');

const app = express();

// Use the morgan middleware with the custom logger
app.use(morgan('combined', { stream: logger.stream.write }));

// handle sessions
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'asdfkljasdofuisdafhj-348r9', resave: false, saveUninitialized: false }));

// Serve static files from the assets directory
app.use(express.static('assets'));

// Set the view engine to pug
app.set('view engine', 'pug');

// Set the isAuthenticated variable
const authMiddleware = require('./middlewares/authMiddleware');
app.use(authMiddleware.globalAuthVariables);

// Routes
app.use('/', publicPages);
app.use('/profile', profilePages);

// Error handling
app.use((req, res, next) => {
    res.status(404).render('404');
});

app.use((req, res, next) => {
    res.status(500).render('500');
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});