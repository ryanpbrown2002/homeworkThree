// modules/router.js
const express = require('express');
const path = require('path');
const db = require('./database');
const pdfValidation = require('./pdfValidation');

// Initialize router
const router = express.Router();

// health endpoint
router.get('/api/health', (req, res) => {
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

// api endpoint to get a single pdf by filename
router.get('pdfs/:filename', (req, res) => {
    const filename = req.params.filename;
    if (!pdfValidation(filename)) {
        return res.status(404).json({ error: 'PDF not found' });
    } else {
        const pdfPath = db.getPDFByFilename(filename).filepath;
        res.sendFile(pdfPath);
    }
});

// handle 404
router.use((req, res) => {
    res.status(404).send('Page not found');
});

// export router
module.exports = router;