const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Import the User model
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const logger = require('../tools/logger');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        req.session.user = user; // Store user in session
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/logout', (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/forgot-password', (req, res) => {
    res.send('Forgot password page');
});

router.get('/register', (req, res) => {
    res.render('registration'); 
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        logger.info(`User registration attempt. email: ${email}; name: ${name}`);

        // Validation: Check if required fields are provided
        if (!name || !email || !password) {
            return res.render('registration', { name, email, error: 'All fields are required' });
        }

        // Validation: Check if email is in valid format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('registration', { name, email, error: 'Invalid email format' });
        }

        // Validation: Check if password is at least 8 characters long
        if (password.length < 8) {
            return res.render('registration', { name, email, error: 'Password should be at least 8 characters long' });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('registration', { name, email, error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            uuid: uuidv4(), 
            is_active: false 
        });

        logger.info(`User registered successfully. email: ${email}; name: ${name}`);

        // TODO: send activation email!!!

        res.redirect('/thank-you');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/thank-you', (req, res) => {
    res.render('thank-you');
});

module.exports = router;