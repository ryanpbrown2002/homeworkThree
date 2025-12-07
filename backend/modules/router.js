// modules/router.js
const express = require('express');
const path = require('path');
const pdfDiscovery = require('./pdfDiscovery');

// Initialize router
const router = express.Router();

// health endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'nodejs-backend'
    });
});

// homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../nginx/public/index.html'));
});

// pdf list page
router.get('/pdfs', (req, res) => {
    res.sendFile(path.join(__dirname, '../nginx/public/pdfs.html'));
});

// api endpoint to get a list of all pdfs
router.get('/api/pdfs', (req, res) => {
    const pdfs = pdfDiscovery();
    res.json(pdfs);
});

// handle 404
router.use((req, res) => {
    res.status(404).send('Page not found');
});

// export router
module.exports = router;