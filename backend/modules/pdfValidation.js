// modules/pdfValidation.js
const fs = require('fs');
const path = require('path');

// Check if pdf document actually exists before serving it to user
function pdfValidation(filename) {
    return fs.existsSync(path.join(__dirname, '../pdfs', filename));
}

// export pdfValidation
module.exports = pdfValidation;