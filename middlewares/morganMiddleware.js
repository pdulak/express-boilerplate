const morgan = require('morgan');
const logger = require('../tools/logger');

function morganLog(req, res, next) {
    console.log(morgan('combined'));
    next();
}

module.exports = { morganLog };