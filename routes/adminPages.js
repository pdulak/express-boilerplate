const express = require('express');
const router = express.Router();
const { User, UserPermission, Permission } = require('../models');

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  if (res.locals.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Admin dashboard route
router.get('/', isAdmin, (req, res) => {
  res.render('admin/dashboard');
});

// Users list
router.get('/users', isAdmin, (req, res) => {
    // get all users oder by name
    User.findAll({ order: [['name', 'ASC']], include: { model: UserPermission, include: Permission } }).then(users => {
        res.render('admin/users', { users });
    });
});

module.exports = router;