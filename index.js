const express = require('express');
const session = require('express-session');
const publicPages = require('./routes/publicPages');
const profilePages = require('./routes/profilePages');
const sequelize = require('sequelize');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'asdfkljasdofuisdafhj-348r9', resave: false, saveUninitialized: false }));

app.use(express.static('assets'));

app.set('view engine', 'pug');

const authMiddleware = require('./middlewares/authMiddleware');
app.use(authMiddleware.globalAuthVariables);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', publicPages);
app.use('/profile', profilePages);

app.use((req, res, next) => {
    res.status(404).render('404');
});

app.use((req, res, next) => {
    res.status(500).render('500');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});