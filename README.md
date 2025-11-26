# Secure PDF Server

A web application with PDF document management capabilities.
You can access the webpage at http://allmydocs.now


# Features

- Homepage with relavant information related to the PDFs
- Page displaying a list of PDFs
- Ability to read and download each PDF


## Architecture

- nginx: Serves static files and acts as reverse proxy
- Node.js/Express: Handles API endpoints and  authentication
- sqlite3: Database to store relevant pdf metadata and file path



# Project Structure
```
hw3/
├── server.js
├── pdfs/                    # Folder for your PDF files
├── public/                  # Static files (CSS, JS, images)
├── views/                   # HTML files or templates
├── modules/
│   ├── router.js           # Custom routing module
│   ├── pdfDiscovery.js     # PDF discovery module
│   ├── pdfValidation.js    # PDF validation module
│   └── database.js         # Database operations
├── package.json
└── README.md
```