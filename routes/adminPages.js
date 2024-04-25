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

// User edit users/edit/NNNN
router.get('/users/edit/:id', isAdmin, (req, res) => {
    // pull available permissions
    Permission.findAll().then(permissions => {
        // get the user and their permissions
        User.findByPk(req.params.id, { include: { model: UserPermission, include: Permission } }).then(user => {
            res.render('admin/user-edit', { user, permissions });
        });
    });
});

// Save user edit
router.post('/users/edit/:id', isAdmin, (req, res) => {
    // get the user
    User.findByPk(req.params.id).then(user => {
        // update the user
        user.update(req.body).then(() => {
            // delete all permissions for the user
            UserPermission.destroy({ where: { userId: user.id } }).then(() => {
                // add the new permissions
                console.log(req.body);
                // there are three possibilities here:
                // 1. req.body.permissions is undefined
                // 2. req.body.permissions is a string (single permission)
                // 3. req.body.permissions is an array of strings (multiple permissions)
                if (req.body.permissions) {
                    if (Array.isArray(req.body.permissions)) {
                        UserPermission.bulkCreate(req.body.permissions.map(permissionId => ({ userId: user.id, permissionId }))).then(() => {
                            res.redirect('/admin/users');
                        });
                    } else {
                        UserPermission.create({ userId: user.id, permissionId: req.body.permissions }).then(() => {
                            res.redirect('/admin/users');
                        });
                    }
                } else {
                    res.redirect('/admin/users');
                }
            });
        });
    });
});

module.exports = router;