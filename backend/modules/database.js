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

// Add a new PDF to database
function addPDF(pdfData) {
    const stmt = db.prepare('INSERT INTO pdfs (filename, filepath, title, description, file_size) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(pdfData.filename, pdfData.filepath, pdfData.title, pdfData.description, pdfData.file_size);
    return { id: result.lastInsertRowid, filename: pdfData.filename, filepath: pdfData.filepath, title: pdfData.title, description: pdfData.description, file_size: pdfData.file_size };
}

// Update a PDF in database
function updatePDF(pdfData) {
    const stmt = db.prepare('UPDATE pdfs SET title = ?, description = ?, file_size = ? WHERE filename = ?');
    const result = stmt.run(pdfData.title, pdfData.description, pdfData.file_size, pdfData.filename);
    return { id: result.lastInsertRowid, filename: pdfData.filename, filepath: pdfData.filepath, title: pdfData.title, description: pdfData.description, file_size: pdfData.file_size };
}


// Get a pdf by its filename
function getPDFByFilename(filename) {
    return db.prepare('SELECT * FROM pdfs WHERE filename = ?').get(filename);
}

// Delete a pdf by its filename
function deletePDF(filename) {
    return db.prepare('DELETE FROM pdfs WHERE filename = ?').run(filename);
}

// Sync database with all folders in pdfs directory upon startup
function syncDatabase() {
    // Get a list of all pdf filenmaes
    const pdfs = pdfDiscovery();
    for (const filename of pdfs) {
        try {
            // check if pdf file exist in db already
            if (!db.getPDFByFilename(filename)) {
                // if not, add it to the database
                const filepath = path.join(__dirname, 'pdfs', filename);
                const fileSize = fs.statSync(filepath).size;
                const title = filename.replace('.pdf', '').replace(/_/g, ' ');
                const dateAdded = new Date().toISOString();
                const lastModified = new Date().toISOString();
                db.addPDF({
                    filename: filename,
                    filepath: filepath,
                    title: title,
                    description: '',
                    file_size: fileSize,
                    date_added: dateAdded,
                    last_modified: lastModified
                });
                console.log(`Added ${filename} to database`);
            } else {
                console.log(`${filename} already exists in database`);
            }
        } catch (error) {
            console.error(`Error adding ${filename} to database: ${error.message}`);
        }
    }
}

module.exports = {
    db: db,
    getAllPDFs: getAllPDFs,
    addPDF: addPDF,
    getPDFByFilename: getPDFByFilename,
    deletePDF: deletePDF,
    syncDatabase: syncDatabase
};