// update-description.js
// Script to update decription for a pdf within the database from the command line

const db = require('./backend/modules/database');

// get args
const filename = process.argv[2];
const description = process.argv[3];

// get pdf from database
const pdf = db.getPDF(filename);

// check if pdf exists in database
if (!pdf) {
    console.error('PDF not found');
    process.exit(1);
}

// update pdf in database
db.updatePDF({
    filename: filename,
    title: pdf.title,
    description: description,
    file_size: pdf.file_size
})