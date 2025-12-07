// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import modules
const db = require('./modules/database');
const router = require('./modules/router');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(router);

db.syncDatabase();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});