const express = require('express');
const router = express.Router();
const { User, UserPermission, Permission } = require('../models'); // Import the User model
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const logger = require('../tools/logger');
const { sendMail } = require('../tools/mailHelper');

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

        // check if user active, if not send to not-active page
        if (!user.is_active) {
            return res.render('not-active');
        }
        
        const user_permissions = await UserPermission.findAll({ where: { userId: user.id }, include: 'Permission' });

        req.session.user = user; // Store user in session
        req.session.user_permissions = user_permissions.map(perm => perm.Permission.code); // Store user permissions in session
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
    res.render('forgot-password');
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    // Validation: check if email is provided
    if (!email) {
        return res.render('forgot-password', { error: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        // do nothing
    } else {
        const reset_hash = uuidv4();
        await User.update({ reset_hash }, { where: { email } });
        const resetLink = `${process.env.BASE_URL}/reset-password/${reset_hash}`;
        sendMail(email, 'Reset your password', `Click here to reset your password: ${resetLink}`);
    }

    res.render('forgot-sent');
});

router.get('/reset-password/:hash', async (req, res) => {
    User.findOne({ where: { reset_hash: req.params.hash } })
        .then(async user => {
            if (!user) {
                return res.status(404).json({ message: 'Invalid reset link' });
            }

            res.render('reset-password');
            return;
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        });
});

router.post('/reset-password/:hash', async (req, res) => {
    const { password, password2 } = req.body;

    // Validation: Check if password is at least 8 characters long
    if (password.length < 8) {
        return res.render('reset-password', { error: 'Password should be at least 8 characters long' });
    }

    // Validation: Check if passwords match
    if (password !== password2) {
        return res.render('reset-password', { error: 'Passwords do not match' });
    }

    User.findOne({ where: { reset_hash: req.params.hash } })
        .then(async user => {
            if (!user) {
                return res.status(404).json({ message: 'Invalid reset link' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.update({ password: hashedPassword, reset_hash: null, is_active: true }, { where: { id: user.id } });
            res.render('reset-OK');
            return;
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        });
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
            return res.render('registration', { name, email, error: 'Name, Email, and Password are required' });
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

        // If this is the first user in the database, set permission to 'is_admin' and activate the user
        const usersCount = await User.count();
        if (usersCount === 1) {
            const user = await User.findOne({ where: { email } });
            const permission = await Permission.findOne({ where: { code: 'is_admin' } });
            await UserPermission.create({ userId: user.id, permissionId: permission.id });
            await User.update({ is_active: true }, { where: { id: user.id } });
            res.redirect('/admin');
        } else {
            const reset_hash = uuidv4();
            await User.update({ reset_hash }, { where: { email } });
            const activationLink = `${process.env.BASE_URL}/activate/${reset_hash}`;
            sendMail(email, 'Activate your account', `Click here to activate your account: ${activationLink}`);
        }

        res.redirect('/thank-you');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/thank-you', (req, res) => {
    res.render('thank-you');
});

router.get('/activate/:hash', async (req, res) => {
    User.findOne({ where: { reset_hash: req.params.hash } })
        .then(async user => {
            if (!user) {
                return res.status(404).json({ message: 'Invalid activation link' });
            }

            await User.update({ is_active: true, reset_hash: null }, { where: { id: user.id } });
            res.render('activation-OK'); 
            return;
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        });
})

module.exports = router;