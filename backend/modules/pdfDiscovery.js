// modules/pdfDiscovery.js
const fs = require('fs');
const path = require('path');


// return a list of all pdfs in the pdfs folder
function pdfDiscovery() {
    const pdfs = fs.readdirSync(path.join(__dirname, '../pdfs'));
    return pdfs;
}

// export pdfDiscovery
module.exports = pdfDiscovery;