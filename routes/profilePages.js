const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { UserPermission } = require('../models');

router.get('/', ensureAuthenticated, async (req, res) => {
    console.log(req.session.user);
    const permissions = await UserPermission.findAll({ where: { userId: req.session.user.id }, include: 'Permission' });
    res.render('profile/profile', { user: req.session.user, permissions });
});

router.get('/change-password', ensureAuthenticated, (req, res) => {
    res.send('Change password page');
});

module.exports = router;