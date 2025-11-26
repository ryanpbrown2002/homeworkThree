# Secure PDF Server

A web application with PDF document management capabilities built with Express, Nginx, and SQLite3.

You can access the webpage at **https://allmydocs.now**

## Features

- **Professional Homepage**: Homepage with information about the PDF collection
- **PDF Library Page**: Page displaying a list of all available PDF documents with metadata
- **PDF Viewing**: Ability to view and download individual PDF documents
- **Secure Access**: HTTPS support with SSL/TLS certificates
- **Metadata Management**: Store and display metadata for each PDF (title, description, file size, date added)

## Architecture

- **Nginx**: Serves static files (HTML, CSS) and acts as reverse proxy for API requests
- **Node.js/Express**: Handles API endpoints and PDF file serving
- **SQLite3**: Database to store PDF metadata (filename, title, description, file size, dates)
- **Docker**: Containerized application with separate services for nginx and backend

## Project Structure

```
hw3/
├── backend/                    # Node.js Express backend
│   ├── Dockerfile
│   ├── server.js              # Main Express server
│   ├── package.json
│   ├── pdfs/                  # Folder for PDF files
│   └── modules/               # Custom modules
│       ├── router.js          # Custom routing module
│       ├── pdfDiscovery.js    # PDF discovery module
│       ├── pdfValidation.js   # PDF validation module
│       ├── database.js        # Database operations
│       └── hw3.db             # SQLite database file
├── nginx/                     # Nginx configuration
│   ├── Dockerfile
│   ├── default.conf          # Nginx configuration
│   └── public/                # Static files served by nginx
│       ├── index.html         # Homepage
│       ├── pdfs.html          # PDF library page
│       └── style.css          # Stylesheet
├── docker-compose.yml         # Docker Compose configuration
└── README.md
```

## Custom Modules

### 1. Routing Module (`modules/router.js`)
- Handles URL routing for the application
- Maps URLs to appropriate handlers
- Implements route definitions for API endpoints and PDF serving
- Handles 404 errors for routes that don't exist

### 2. PDF Discovery Module (`modules/pdfDiscovery.js`)
- Searches for available PDF documents in the designated folder
- Scans the folder and creates a list of available PDFs
- Handles file system operations to read directory contents
- Can cache the PDF list to avoid repeated file system reads

### 3. PDF Validation Module (`modules/pdfValidation.js`)
- Validates that requested PDF documents exist
- Checks if files are within the designated folder
- Sanitizes filenames to prevent directory traversal attacks
- Returns appropriate error responses (e.g., 404) if PDFs don't exist

### 4. Database Module (`modules/database.js`)
- Manages SQLite3 database operations
- Provides functions to query and update PDF metadata
- Handles database connection and error management

## Database Schema

The application uses SQLite3 with the following schema:

```sql
CREATE TABLE pdfs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    filepath TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_size INTEGER,
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `id`: Unique identifier for each PDF
- `filename`: The PDF filename (e.g., "document.pdf")
- `filepath`: Full path to the PDF file
- `title`: Display title for the PDF
- `description`: Optional description of the PDF content
- `file_size`: Size of the file in bytes
- `date_added`: Timestamp when the PDF was added
- `last_modified`: Timestamp when the PDF metadata was last updated

## Routing Structure

### Static Routes (Served by Nginx)
- `/` - Homepage (`index.html`)
- `/pdfs` - PDF Library page (`pdfs.html`)
- `/style.css` - Stylesheet

### API Routes (Proxied to Backend)
- `GET /api/pdfs` - Returns JSON array of all PDFs with metadata
- `GET /health` - Health check endpoint
- `GET /pdf/:filename` - Serves individual PDF files

### How Routing Works
1. Nginx serves static files directly from `/usr/share/nginx/html/`
2. API routes (`/api/*`, `/health`, `/pdf/*`) are proxied to the Node.js backend
3. The backend uses a custom routing module to handle requests
4. PDF files are served using Express's `sendFile()` method (not static middleware)
5. All HTTP traffic redirects to HTTPS

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured (for SSL certificates)
- SSL certificates in `nginx/letsencrypt/live/npm-3/`

### Running the Application

1. **Build and start containers:**
   ```bash
   docker compose up -d --build
   ```

2. **Add PDF files:**
   - Place PDF files in `backend/pdfs/` directory
   - Add metadata to the database using the database module functions

3. **Access the application:**
   - Homepage: `https://allmydocs.now`
   - PDF Library: `https://allmydocs.now/pdfs`


