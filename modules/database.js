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


module.exports = db;