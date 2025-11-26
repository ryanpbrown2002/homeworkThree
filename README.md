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
├── docker-compose.dev.yml     # Docker dev configuration
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

The application uses better-sqlite3 with the following schema:

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

- **Docker** and **Docker Compose** installed
  - Check installation: `docker --version` and `docker compose version`
  - Install from: https://docs.docker.com/get-docker/
- **Git** (for cloning the repository)
- **Domain name** (optional, for production with HTTPS)
- **SSL certificates** (optional, for HTTPS - can use self-signed for local development)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd hw3
```

### Step 2: Set Up PDFs Folder

Create the PDFs directory and add your PDF files:

```bash
mkdir -p backend/pdfs
# Copy your PDF files into backend/pdfs/
# Example: cp ~/documents/*.pdf backend/pdfs/
```

### Step 3: SSL Certificates (For HTTPS)

**Option A: Configure certificates using Nginx proxy manager**

**Option B: Local Development Without HTTPS**
- For local development, you can modify `nginx/default.conf` to remove HTTPS requirements
- Or use self-signed certificates


### Step 4: Build and Start the Application

```bash
# Build and start all containers
docker compose up -d --build

# Check container status
docker compose ps

# View logs
docker compose logs -f
```

### Step 5: Verify the Application

1. **Check that containers are running:**
   ```bash
   docker compose ps
   ```
   You should see both `nginx` and `backend-nodejs` containers running.

2. **Check backend logs for PDF sync:**
   ```bash
   docker logs backend-nodejs
   ```
   You should see messages about PDFs being discovered and added to the database.

3. **Access the application:**
   - **Homepage**: `https://localhost` or `https://allmydocs.now`
   - **PDF Library**: `https://localhost/pdfs` or `https://allmydocs.now/pdfs`
   - **API Endpoint**: `https://localhost/api/pdfs` or `https://allmydocs.now/api/pdfs`

### Step 6: Add PDFs to the Database

PDFs are automatically synced when the server starts. If you add new PDFs:

1. Place PDF files in `backend/pdfs/` directory
2. Restart the backend container:
   ```bash
   docker compose restart backend-nodejs
   ```
3. The server will automatically discover and add new PDFs to the database

### Step 7: Update PDF Descriptions (Optional)

To update PDF descriptions, use the provided script:

```bash
node update-description.js "filename.pdf" "Your description here"
```

**Example:**
```bash
node update-description.js "Moby_Dick.pdf" "A classic American novel by Herman Melville about Captain Ahab's obsessive quest for revenge against the white whale Moby Dick"
```

## Common Commands

### Managing Containers

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart containers
docker compose restart

# Rebuild and restart
docker compose up -d --build

# View logs
docker compose logs -f
docker logs backend-nodejs
docker logs nginx
```



