// modules/pdfValidation.js
const fs = require('fs');
const path = require('path');

/**
 * PDF Validation Module
 * Checks if requested PDF documents exist and are within the designated folder
 */

const PDF_FOLDER = path.join(__dirname, '..', 'pdfs');

/**
 * Validates if a PDF file exists in the designated folder
 * @param {string} filename - The name of the PDF file to validate
 * @returns {boolean} - True if file exists, false otherwise
 */
function validatePDF(filename) {
    try {
        // Construct full file path
        const filepath = path.join(PDF_FOLDER, filename);

        // Check if file exists
        if (fs.existsSync(filepath)) {
            return true;
        }

        // Check if file extension is .pdf
        if (!filename.endsWith('.pdf')) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validating PDF:', error);
        return false;
    }
}

/**
 * Sanitizes a filename to prevent directory traversal
 * @param {string} filename - The filename to sanitize
 * @returns {string} - The sanitized filename
 */
function sanitizeFilename(filename) {
    // Remove any path separators and parent directory references
    return path.basename(filename);
}

module.exports = { validatePDF, sanitizeFilename };