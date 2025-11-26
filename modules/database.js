const Database = require('better-sqlite3');
const path = require('path');

// Connect to database file
const dbPath = path.join(__dirname, 'hw3.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS pdfs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        filepath TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        file_size INTEGER,
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

/**
 * Gets all PDFs from the database
 * @returns {Array} - Array of PDF objects
 */
function getAllPDFs() {
    return db.all('SELECT * FROM pdfs ORDER BY date_added DESC');
}

/**
 * Adds a new PDF to the database
 * @param {object} pdfData - Object containing filename, filepath, title, description
 * @param {function} callback - Callback function (err)
 */
function addPDF(pdfData, callback) {
    const { filename, filepath, title, description } = pdfData;
    db.run(
        'INSERT INTO pdfs (filename, filepath, title, description) VALUES (?, ?, ?, ?)',
        [filename, filepath, title, description],
        callback
    );
}

/**
 * Gets a single PDF by filename
 * @param {string} filename - The PDF filename
 * @param {function} callback - Callback function (err, row)
 */
function getPDFByFilename(filename, callback) {
    db.get('SELECT * FROM pdfs WHERE filename = ?', [filename], callback);
}

/**
 * Deletes a PDF from the database
 * @param {string} filename - The PDF filename
 * @param {function} callback - Callback function (err)
 */
function deletePDF(filename, callback) {
    db.run('DELETE FROM pdfs WHERE filename = ?', [filename], callback);
}

/**
 * Updates an existing PDF's metadata
 * @param {string} filename - The PDF filename
 * @param {object} updates - Object containing fields to update
 * @param {function} callback - Callback function (err)
 */
function updatePDF(filename, updates, callback) {
    const { title, description } = updates;
    db.run(
        'UPDATE pdfs SET title = ?, description = ? WHERE filename = ?',
        [title, description, filename],
        callback
    );
}

/**
 * Closes the database connection
 */
function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
    });
}

module.exports = {
    getAllPDFs,
    getPDFByFilename,
    deletePDF,
    updatePDF,
    closeDatabase,
    addPDF,
    db
};