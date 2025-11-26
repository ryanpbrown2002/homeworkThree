// server.js
const express = require('express');
const path = require('path');

// Import modules
const db = require('./modules/database');
const Router = require('./modules/router');
const pdfDiscovery = require('./modules/pdfDiscovery');
const pdfValidation = require('./modules/pdfValidation');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize router
const router = new Router();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Homepage route - Note: nginx serves static index.html for root route
// This route is kept for API access if needed, but won't be hit by normal web traffic
router.get('/', (req, res) => {
    res.json({ 
        message: 'API endpoint - homepage is served by nginx',
        timestamp: new Date().toISOString()
    });
});

router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'nodejs-backend'
    });
});

// API endpoint to get all PDFs as JSON
router.get('/api/pdfs', (req, res) => {
    // Get all PDFs from the database
    db.getAllPDFs((err, pdfs) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch PDFs' });
            return;
        }
        res.json(pdfs);
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