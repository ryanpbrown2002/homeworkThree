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
        // First check if filename ends with .pdf
        if (!filename.toLowerCase().endsWith('.pdf')) {
            return false;
        }

        // Sanitize the filename to prevent directory traversal
        const sanitized = sanitizeFilename(filename);
        
        // Construct full file path
        const filepath = path.join(PDF_FOLDER, sanitized);

        // Check if file exists
        if (fs.existsSync(filepath)) {
            // Additional security: ensure the resolved path is within PDF_FOLDER
            const resolvedPath = path.resolve(filepath);
            const resolvedFolder = path.resolve(PDF_FOLDER);
            if (!resolvedPath.startsWith(resolvedFolder)) {
                console.error('Directory traversal attempt detected');
                return false;
            }
            return true;
        }

        return false;
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