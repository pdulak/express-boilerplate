function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function globalAuthVariables(req, res, next) {
    res.locals.isAuthenticated = req.session.user ? true : false;
    next();
}

module.exports = { ensureAuthenticated, globalAuthVariables };