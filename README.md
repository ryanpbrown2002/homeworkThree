# Classic Novels Library

A web application for managing and accessing a digital collection of classic novels and literary works, built with Express, Nginx, and SQLite3.

You can access the webpage at **https://allmydocs.now**


## Features

- **Homepage**: Professionally styled homepage with basic information about the literary collection
- **Novel Collection**: Page displaying a list of classic novels, displaying metadata for each.
- **Access Novels**: Read and download novels, accessible via https://allmydocs.com/pdfs/{document_name}.pdf
- **Security**: SSL/TLS certificates allow for HTTPS enabled


## Architecture

- **Nginx**: Serves static files (HTML, CSS) and acts as reverse proxy for API requests
- **Node.js/Express**: Handles API endpoints and novel PDF file serving
- **SQLite3**: Database to store novel metadata (filename, title, description, author info, file size, dates)
- **Docker**: Containerized application with separate services for nginx and backend


## Project Structure

```
hw3/
├── backend/                   # Node.js Express backend
│   ├── Dockerfile
│   ├── server.js              # Main Express server
│   ├── package.json
│   ├── pdfs/                  # Folder for novel PDF files
│   └── modules/               # Custom modules
│       ├── router.js          # Custom routing module
│       ├── pdfDiscovery.js    # PDF discovery module
│       ├── pdfValidation.js   # PDF validation module
│       ├── database.js        # Database operations
├── nginx/                     # Nginx configuration
│   ├── Dockerfile
│   ├── default.conf           # Nginx configuration
│   └── public/                # Static files served by nginx
│       ├── index.html         # Homepage
│       ├── pdfs.html          # Novel collection page
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

### 3. PDF Validation Module (`modules/pdfValidation.js`)
- Validates that requested PDF documents exist
- Checks if files are within the designated folder

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
- `id`: Unique identifier for each novel
- `filename`: The PDF filename (e.g., "Moby_Dick.pdf")
- `filepath`: Full path to the novel PDF file
- `title`: Display title for the novel (e.g., "Moby Dick")
- `description`: Optional description of the novel, including author, themes, and literary significance
- `file_size`: Size of the PDF file in bytes
- `date_added`: Timestamp when the novel was added to the collection
- `last_modified`: Timestamp when the novel metadata was last updated


## Routing Structure

### Static Routes (Served by Nginx)
- `/` - Homepage showcasing the classic novels collection (`index.html`)
- `/pdfs` - Novel Collection page displaying all available novels (`pdfs.html`)
- `/style.css` - Stylesheet

### API Routes (Proxied to Backend)
- `GET /api/pdfs` - Returns JSON array of all novels with metadata (title, description, author info, etc.)
- `GET /api/health` - Health check endpoint
- `GET /pdfs/:filename` - Serves individual novel PDF files

### How Routing Works
1. Nginx serves static files
2. API routes (`/api/*`, `/pdfs/*`) are proxied to the Node.js backend
3. The backend uses the routing module to handle requests
4. PDF files are served using Express
5. All HTTP traffic redirects to HTTPS


## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd hw3
```

### Step 2: Set Up Novels Folder

Create the PDFs directory and add your novel PDF files:

```bash
mkdir -p backend/pdfs
# Copy your novel PDF files into backend/pdfs/
# Example: cp ~/novels/*.pdf backend/pdfs/
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

2. **Access the application:**
   - **Homepage**: `https://localhost` or `https://allmydocs.now`
   - **Novel Collection**: `https://localhost/pdfs` or `https://allmydocs.now/pdfs`
   - **API Endpoint**: `https://localhost/api/pdfs` or `https://allmydocs.now/api/pdfs`

### Step 6: Add Novels to the Database

Novels are automatically synced when the server starts. If you add new novel PDFs:

1. Place novel PDF files in `backend/pdfs/` directory
2. Restart the backend container:
   ```bash
   docker compose restart backend-nodejs
   ```
3. The server will automatically discover and add new novels to the database