// modules/database.js
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

// Get all PDFs from database
function getAllPDFs() {
    return db.prepare('SELECT * FROM pdfs ORDER BY date_added DESC').all();
}

// Get a pdf by its filename
function getPDF(filename) {
    return db.prepare('SELECT * FROM pdfs WHERE filename = ?').get(filename);
}

// Add a new PDF to database
function addPDF(pdfData) {
    const stmt = db.prepare('INSERT INTO pdfs (filename, filepath, title, description, file_size) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(pdfData.filename, pdfData.filepath, pdfData.title, pdfData.description, pdfData.file_size);
    return { id: result.lastInsertRowid, filename: pdfData.filename, filepath: pdfData.filepath, title: pdfData.title, description: pdfData.description, file_size: pdfData.file_size };
}

// Update a PDF in database
function updatePDF(pdfData) {
    const stmt = db.prepare('UPDATE pdfs SET title = ?, description = ?, file_size = ?, last_modified = CURRENT_TIMESTAMP WHERE filename = ?');
    stmt.run(pdfData.title, pdfData.description, pdfData.file_size, pdfData.filename );
}


// Get a pdf by its filename
function getPDFByFilename(filename) {
    return db.prepare('SELECT * FROM pdfs WHERE filename = ?').get(filename);
}

// Delete a pdf by its filename
function deletePDF(filename) {
    return db.prepare('DELETE FROM pdfs WHERE filename = ?').run(filename);
}

module.exports = {
    db: db,
    getAllPDFs: getAllPDFs,
    getPDF: getPDF,
    addPDF: addPDF,
    getPDFByFilename: getPDFByFilename,
    deletePDF: deletePDF,
    updatePDF: updatePDF
};