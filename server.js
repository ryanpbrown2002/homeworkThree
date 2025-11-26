// server.js
const express = require('express');
const path = require('path');

// Import modules
const db = require('./modules/database');
const Router = require('./modules/router');
const pdfDiscovery = require('./modules/pdfDiscovery');
const pdfValidation = require('./modules/pdfValidation');
const generatePDFListHTML = require('./views/pdfListTemplate');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize router
const router = new Router();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Homepage route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API route
router.get('/api', (req, res) => {
    res.json({
      message: 'Welcome to my Node.js Express app!',
      timestamp: new Date().toISOString(),
    });
});

// List PDFs route
router.get('/pdfs', (req, res) => {
    // Get all PDFs from the database
    db.getAllPDFs((err, pdfs) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch PDFs' });
        } 
        const html = generatePDFListHTML(pdfs);
        res.send(html);
    });
});

// Individual PDF route
router.get('/pdf/:filename', (req, res) => {
    const urlParts = req.url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const sanitizedFilename = pdfValidation.sanitizeFilename(filename);

    // Validate the filename
    if (!pdfValidation.validatePDF(sanitizedFilename)) {
        res.status(404).send('PDF not found');
        return;
    }

    const pdfPath = path.join(__dirname, 'pdfs', sanitizedFilename);
    res.sendFile(pdfPath);
});

app.use(router.middleware());

app.use((req, res) => {
    router.handle404(req, res);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});