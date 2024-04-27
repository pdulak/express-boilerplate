const publicPages = require('../routes/publicPages');
const profilePages = require('../routes/profilePages');
const adminPages = require('../routes/adminPages');

module.exports = function (app) {
    app.use('/', publicPages);
    app.use('/profile', profilePages);
    app.use('/admin', adminPages);

    // Error handling
    app.use((req, res, next) => {
        res.status(404).render('404');
    });

    app.use((req, res, next) => {
        res.status(500).render('500');
    });
};