// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

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
    const pdfs = db.getAllPDFs();
    res.json(pdfs);
});


app.use(router.middleware());

app.use((req, res) => {
    router.handle404(req, res);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});