// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

// Import modules
const db = require('./modules/database');
const router = require('./modules/router');
const pdfDiscovery = require('./modules/pdfDiscovery');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// use router
app.use(router);

// sync database upon startup
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
                db.addPDF({
                    filename: filename,
                    filepath: filepath,
                    title: title,
                    description: '',
                    file_size: fileSize
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
syncDatabase();

// start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});