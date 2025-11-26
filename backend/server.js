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
    db.getAllPDFs((err, pdfs) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch PDFs' });
            return;
        }
        res.json(pdfs);
    });
});

/**
 * Syncs PDFs from filesystem to database
 * This function runs automatically on server startup
 * - Adds new PDFs found in filesystem
 * - Removes database entries for PDFs that no longer exist
 */
function syncPDFsToDatabase() {
    const pdfsFolder = path.join(__dirname, 'pdfs');
    
    // Check if pdfs folder exists
    if (!fs.existsSync(pdfsFolder)) {
        console.warn(`PDFs folder not found at: ${pdfsFolder}`);
        // Still clean up orphaned database entries
        cleanupOrphanedPDFs([]);
        return;
    }
    
    // Discover PDFs from filesystem
    const discoveredPDFs = pdfDiscovery.discoverPDFs(false); // Don't use cache
    
    console.log(`Syncing PDFs to database...`);
    if (discoveredPDFs.length === 0) {
        console.log('No PDFs found in the pdfs folder');
        // Still clean up orphaned database entries
        cleanupOrphanedPDFs([]);
        return;
    }
    
    console.log(`Found ${discoveredPDFs.length} PDF(s) in filesystem`);
    
    let processed = 0;
    let synced = 0;
    let alreadyExists = 0;
    let errors = [];
    const total = discoveredPDFs.length;
    
    // Process each discovered PDF
    discoveredPDFs.forEach(filename => {
        const filepath = path.join(pdfsFolder, filename);
        
        // Check if PDF already exists in database
        db.getPDFByFilename(filename, (err, existing) => {
            processed++;
            
            if (err) {
                console.error(`Error checking ${filename}:`, err.message);
                errors.push(`Error checking ${filename}: ${err.message}`);
            } else if (!existing) {
                // If PDF doesn't exist in database, add it
                try {
                    // Get file stats for file size
                    const stats = fs.statSync(filepath);
                    const fileSize = stats.size;
                    
                    // Generate a title from filename (remove .pdf extension and format)
                    const title = filename
                        .replace(/\.pdf$/i, '')
                        .replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    // Add to database
                    db.addPDF({
                        filename: filename,
                        filepath: filepath,
                        title: title,
                        description: `PDF document: ${title}`,
                        file_size: fileSize
                    }, (err) => {
                        if (err) {
                            console.error(`Error adding ${filename}:`, err.message);
                            errors.push(`Error adding ${filename}: ${err.message}`);
                        } else {
                            synced++;
                            console.log(`✓ Added PDF to database: ${filename}`);
                        }
                        
                        // When all PDFs are processed, clean up orphaned entries and log summary
                        if (processed === total) {
                            cleanupOrphanedPDFs(discoveredPDFs, () => {
                                console.log(`\n--- PDF Sync Summary ---`);
                                console.log(`Total PDFs found: ${total}`);
                                console.log(`New PDFs added: ${synced}`);
                                console.log(`Already in database: ${alreadyExists}`);
                                if (errors.length > 0) {
                                    console.log(`Errors: ${errors.length}`);
                                    errors.forEach(err => console.log(`  - ${err}`));
                                }
                            });
                        }
                    });
                } catch (err) {
                    console.error(`Error processing ${filename}:`, err.message);
                    errors.push(`Error processing ${filename}: ${err.message}`);
                    
                    // When all PDFs are processed, clean up orphaned entries and log summary
                    if (processed === total) {
                        cleanupOrphanedPDFs(discoveredPDFs, () => {
                            console.log(`\n--- PDF Sync Summary ---`);
                            console.log(`Total PDFs found: ${total}`);
                            console.log(`New PDFs added: ${synced}`);
                            console.log(`Already in database: ${alreadyExists}`);
                            if (errors.length > 0) {
                                console.log(`Errors: ${errors.length}`);
                                errors.forEach(err => console.log(`  - ${err}`));
                            }
                        });
                    }
                }
            } else {
                // PDF already exists
                alreadyExists++;
                console.log(`- PDF already in database: ${filename}`);
                
                // When all PDFs are processed, clean up orphaned entries and log summary
                if (processed === total) {
                    cleanupOrphanedPDFs(discoveredPDFs, () => {
                        console.log(`\n--- PDF Sync Summary ---`);
                        console.log(`Total PDFs found: ${total}`);
                        console.log(`New PDFs added: ${synced}`);
                        console.log(`Already in database: ${alreadyExists}`);
                        if (errors.length > 0) {
                            console.log(`Errors: ${errors.length}`);
                            errors.forEach(err => console.log(`  - ${err}`));
                        }
                    });
                }
            }
        });
    });
}

/**
 * Removes database entries for PDFs that no longer exist in the filesystem
 * @param {Array} discoveredPDFs - Array of PDF filenames that exist in filesystem
 * @param {function} callback - Optional callback when cleanup is complete
 */
function cleanupOrphanedPDFs(discoveredPDFs, callback) {
    console.log('Checking for orphaned database entries...');
    
    // Get all PDFs from database
    db.getAllPDFs((err, dbPDFs) => {
        if (err) {
            console.error('Error getting PDFs from database:', err);
            if (callback) callback();
            return;
        }
        
        if (!dbPDFs || dbPDFs.length === 0) {
            console.log('No PDFs in database to check');
            if (callback) callback();
            return;
        }
        
        const discoveredSet = new Set(discoveredPDFs);
        let removed = 0;
        let checked = 0;
        
        // Check each database entry
        dbPDFs.forEach(dbPDF => {
            checked++;
            
            // If PDF in database doesn't exist in filesystem, remove it
            if (!discoveredSet.has(dbPDF.filename)) {
                db.deletePDF(dbPDF.filename, (err) => {
                    if (err) {
                        console.error(`Error removing orphaned PDF ${dbPDF.filename}:`, err);
                    } else {
                        removed++;
                        console.log(`✗ Removed orphaned database entry: ${dbPDF.filename}`);
                    }
                    
                    // When all entries are checked, log summary
                    if (checked === dbPDFs.length) {
                        if (removed > 0) {
                            console.log(`Removed ${removed} orphaned database entry/entries`);
                        } else {
                            console.log('No orphaned entries found');
                        }
                        if (callback) callback();
                    }
                });
            } else {
                // When all entries are checked, log summary
                if (checked === dbPDFs.length) {
                    if (removed > 0) {
                        console.log(`Removed ${removed} orphaned database entry/entries`);
                    } else {
                        console.log('No orphaned entries found');
                    }
                    if (callback) callback();
                }
            }
        });
    });
}

// Individual PDF route
router.get('/pdf/:filename', (req, res) => {
    // Get filename from URL parameter
    let filename = req.params ? req.params.filename : null;
    
    // Fallback: try to extract from URL if params not available
    if (!filename) {
        const urlParts = req.url.split('/');
        filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query string
    }
    
    console.log(`PDF request - URL: ${req.url}, Filename: ${filename}`);
    
    // Decode URL encoding if present
    try {
        filename = decodeURIComponent(filename);
    } catch (e) {
        console.error('Error decoding filename:', e);
        res.status(400).send('Invalid filename');
        return;
    }
    
    const sanitizedFilename = pdfValidation.sanitizeFilename(filename);
    console.log(`Sanitized filename: ${sanitizedFilename}`);

    // Validate the filename
    if (!pdfValidation.validatePDF(sanitizedFilename)) {
        console.log(`PDF validation failed for: ${sanitizedFilename}`);
        res.status(404).send('PDF not found');
        return;
    }

    const pdfPath = path.join(__dirname, 'pdfs', sanitizedFilename);
    console.log(`Sending PDF from: ${pdfPath}`);
    
    // Send the PDF file
    res.sendFile(pdfPath, (err) => {
        if (err) {
            console.error('Error sending PDF file:', err);
            if (!res.headersSent) {
                res.status(500).send('Error serving PDF file');
            }
        } else {
            console.log(`Successfully sent PDF: ${sanitizedFilename}`);
        }
    });
});

app.use(router.middleware());

app.use((req, res) => {
    router.handle404(req, res);
});

// Sync PDFs to database on startup
console.log('Starting PDF sync on server startup...');
syncPDFsToDatabase();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});