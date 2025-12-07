// server.js
const express = require('express');

// Import modules
const db = require('./modules/database');
const router = require('./modules/router');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// use router
app.use(router);

// sync database upon startup
db.syncDatabase();

// start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});