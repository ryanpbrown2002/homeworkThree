// modules/pdfListTemplate.js

/**
 * Generates HTML for the PDF list page
 * @param {Array} pdfs - Array of PDF objects from database
 * @returns {string} - Complete HTML page
 */
function generatePDFListHTML(pdfs) {
    const pdfItems = pdfs.length === 0 
        ? '<p>No PDFs available yet.</p>'
        : pdfs.map(pdf => `
            <div class="pdf-item">
                <h3>${pdf.title}</h3>
                <p>${pdf.description || 'No description available'}</p>
                <a href="/pdf/${pdf.filename}" class="btn">View PDF</a>
            </div>
        `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>PDF Library</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            <nav>
                <a href="/">Home</a>
                <a href="/pdfs">PDF Library</a>
            </nav>
            <div class="container">
                <h1>Available PDF Documents</h1>
                <div class="pdf-list">
                    ${pdfItems}
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = { generatePDFListHTML };