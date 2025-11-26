const Database = require('better-sqlite3');
const path = require('path');

// Connect to database file
const dbPath = path.join(__dirname, 'hw3.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
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
 * @param {function} callback - Callback function (err, pdfs)
 */
function getAllPDFs(callback) {
    try {
        const stmt = db.prepare('SELECT * FROM pdfs ORDER BY date_added DESC');
        const pdfs = stmt.all();
        callback(null, pdfs);
    } catch (err) {
        callback(err, null);
    }
}

/**
 * Adds a new PDF to the database
 * @param {object} pdfData - Object containing filename, filepath, title, description, file_size
 * @param {function} callback - Callback function (err)
 */
function addPDF(pdfData, callback) {
    try {
        const { filename, filepath, title, description, file_size } = pdfData;
        const stmt = db.prepare('INSERT INTO pdfs (filename, filepath, title, description, file_size) VALUES (?, ?, ?, ?, ?)');
        stmt.run(filename, filepath, title, description || null, file_size || null);
        callback(null);
    } catch (err) {
        callback(err);
    }
}

/**
 * Gets a single PDF by filename
 * @param {string} filename - The PDF filename
 * @param {function} callback - Callback function (err, row)
 */
function getPDFByFilename(filename, callback) {
    try {
        const stmt = db.prepare('SELECT * FROM pdfs WHERE filename = ?');
        const row = stmt.get(filename);
        callback(null, row);
    } catch (err) {
        callback(err, null);
    }
}

/**
 * Deletes a PDF from the database
 * @param {string} filename - The PDF filename
 * @param {function} callback - Callback function (err)
 */
function deletePDF(filename, callback) {
    try {
        const stmt = db.prepare('DELETE FROM pdfs WHERE filename = ?');
        stmt.run(filename);
        callback(null);
    } catch (err) {
        callback(err);
    }
}

/**
 * Updates an existing PDF's metadata
 * @param {string} filename - The PDF filename
 * @param {object} updates - Object containing fields to update
 * @param {function} callback - Callback function (err)
 */
function updatePDF(filename, updates, callback) {
    try {
        const { title, description } = updates;
        const stmt = db.prepare('UPDATE pdfs SET title = ?, description = ? WHERE filename = ?');
        stmt.run(title, description, filename);
        callback(null);
    } catch (err) {
        callback(err);
    }
}

/**
 * Closes the database connection
 */
function closeDatabase() {
    try {
        db.close();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing database:', err);
    }
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