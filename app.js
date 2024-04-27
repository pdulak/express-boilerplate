const express = require('express');
const app = express();

require('dotenv').config();

// Middleware and Routes
require('./config/middleware')(app);
require('./config/routes')(app);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});