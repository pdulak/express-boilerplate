const express = require('express');
const router = express.Router();
const { User, UserPermission, Permission } = require('../models');
// import { Op } from '@sequelize/core';
// write above line as below if you are using sequelize v5
const { Op } = require('sequelize')

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
    // pull available permissions
    Permission.findAll().then(permissions => {
        // get the user
        User.findByPk(req.params.id, { include: { model: UserPermission, include: Permission } }).then(user => {
            // check if unique email and if name is not empty
            User.findOne({ where: { email: req.body.email, id: { [Op.ne]: user.id } } }).then(userWithSameEmail => {
                if (userWithSameEmail && userWithSameEmail.id !== user.id) {
                    res.render('admin/user-edit', { user, permissions, error: 'Email already in use' });
                    return;
                }

                if (!req.body.name) {
                    res.render('admin/user-edit', { user, permissions, error: 'Name cannot be empty' });
                    return;
                }
            });

            // update the user
            user.update(req.body).then(() => {
                // delete all permissions for the user
                UserPermission.destroy({ where: { userId: user.id } }).then(() => {
                    // there are three possibilities here:
                    // 1. req.body.permissions is undefined
                    // 2. req.body.permissions is a string (single permission)
                    // 3. req.body.permissions is an array of strings (multiple permissions)
                    if (req.body.permissions) {
                        if (Array.isArray(req.body.permissions)) {
                            UserPermission.bulkCreate(req.body.permissions.map(permissionId => ({ userId: user.id, permissionId }))).then(() => {
                                res.redirect('/admin/users');
                                return;
                            });
                        } else {
                            UserPermission.create({ userId: user.id, permissionId: req.body.permissions }).then(() => {
                                res.redirect('/admin/users');
                                return;
                            });
                        }
                    } else {
                        res.redirect('/admin/users');
                        return;
                    }
                });
            });
        });
    });
});

module.exports = router;