#!/usr/bin/env node

/**
 * Simple script to update a single PDF description
 * Usage: node update-description.js <filename> "<description>"
 * Example: node update-description.js "Moby_Dick.pdf" "A classic novel about a man's obsession with hunting a whale"
 */

const db = require('./backend/modules/database');

const filename = process.argv[2];
const description = process.argv[3];

if (!filename || !description) {
    console.log('Usage: node update-description.js <filename> "<description>"');
    console.log('Example: node update-description.js "Moby_Dick.pdf" "A classic novel about hunting a whale"');
    process.exit(1);
}

// Get the PDF first to preserve the title
db.getPDFByFilename(filename, (err, pdf) => {
    if (err) {
        console.error('Error fetching PDF:', err);
        db.closeDatabase();
        process.exit(1);
    }
    
    if (!pdf) {
        console.error(`PDF not found: ${filename}`);
        console.log('\nAvailable PDFs:');
        db.getAllPDFs((err, pdfs) => {
            if (!err && pdfs) {
                pdfs.forEach(p => console.log(`  - ${p.filename}`));
            }
            db.closeDatabase();
            process.exit(1);
        });
        return;
    }
    
    // Update the description
    db.updatePDF(filename, {
        title: pdf.title,
        description: description
    }, (err) => {
        if (err) {
            console.error('Error updating description:', err);
            db.closeDatabase();
            process.exit(1);
        }
        
        console.log(`✓ Updated description for ${filename}`);
        console.log(`  Title: ${pdf.title}`);
        console.log(`  Description: ${description}`);
        db.closeDatabase();
        process.exit(0);
    });
});

