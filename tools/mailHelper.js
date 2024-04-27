const { createTransport } = require('nodemailer');
const logger = require('./logger');
require('dotenv').config();

const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendMail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        logger.info(`Sending email to ${to} with subject: ${subject}`);
        if (error) {
            logger.error(error);
        } else {
            logger.info('Email sent: ' + info.response);
        }
    });
}

module.exports = { sendMail };