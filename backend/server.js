// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import modules
const db = require('./modules/database');
const router = require('./modules/router');
const pdfDiscovery = require('./modules/pdfDiscovery');
const pdfValidation = require('./modules/pdfValidation');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(router);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get all PDFs as JSON
router.get('/api/pdfs', (req, res) => {
    // Get all PDFs from the database
    const pdfs = db.getAllPDFs();
    res.json(pdfs);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});