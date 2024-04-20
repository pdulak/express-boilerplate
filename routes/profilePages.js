const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('profile/profile', { user: req.session.user });
});

router.get('/change-password', ensureAuthenticated, (req, res) => {
    res.send('Change password page');
});

module.exports = router;