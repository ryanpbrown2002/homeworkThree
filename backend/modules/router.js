// modules/router.js
const express = require('express');
const path = require('path');

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
    const pdfs = db.getAllPDFs();
    res.json(pdfs);
});

module.exports = router;