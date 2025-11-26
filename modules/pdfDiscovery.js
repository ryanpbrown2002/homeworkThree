// modules/pdfDiscovery.js
const fs = require('fs');
const path = require('path');

/**
 * PDF Discovery Module
 * Searches for available PDF documents in the designated folder
 */

const PDF_FOLDER = path.join(__dirname, '..', 'pdfs');

// Cache for PDF list to avoid repeated file system reads (per rubric requirement)
let pdfCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // Cache for 60 seconds

/**
 * Discovers all PDF files in the designated folder
 * @param {boolean} useCache - Whether to use cached results (default: true)
 * @returns {Array} - Array of PDF filenames
 */
function discoverPDFs(useCache = true) {
    try {
        // Check if we have valid cached data
        if (useCache && pdfCache && cacheTimestamp) {
            const now = Date.now();
            if (now - cacheTimestamp < CACHE_DURATION) {
                console.log('Returning cached PDF list');
                return pdfCache;
            }
        }
        
        // Check if PDF folder exists
        if (!fs.existsSync(PDF_FOLDER)) {
            console.error(`PDF folder does not exist: ${PDF_FOLDER}`);
            return [];
        }
        
        // Read directory contents
        const files = fs.readdirSync(PDF_FOLDER);
        
        // Filter for PDF files only
        const pdfFiles = files.filter(file => {
            return file.toLowerCase().endsWith('.pdf');
        });
        
        // Update cache
        pdfCache = pdfFiles;
        cacheTimestamp = Date.now();
        
        console.log(`Discovered ${pdfFiles.length} PDF(s)`);
        return pdfFiles;
        
    } catch (error) {
        console.error('Error discovering PDFs:', error);
        return [];
    }
}

/**
 * Clears the PDF cache, forcing a fresh directory read on next discovery
 */
function clearCache() {
    pdfCache = null;
    cacheTimestamp = null;
    console.log('PDF cache cleared');
}

module.exports = { discoverPDFs, clearCache };