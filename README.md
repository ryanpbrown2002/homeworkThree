# Classic Novels Library

A web application for managing and accessing a digital collection of classic novels and literary works, built with Express, Nginx, and SQLite3.

You can access the webpage at **https://allmydocs.now**

## Features

- **Professional Homepage**: Elegant homepage showcasing the classic novels collection with information about the literary works
- **Novel Collection Page**: Curated page displaying all available novels with detailed metadata including author information and descriptions
- **Novel Reading**: Ability to read and download individual novels in PDF format
- **Secure Access**: HTTPS support with SSL/TLS certificates for secure access to the literary collection
- **Rich Metadata**: Store and display comprehensive information for each novel including title, author, description, file size, and date added

## Architecture

- **Nginx**: Serves static files (HTML, CSS) and acts as reverse proxy for API requests
- **Node.js/Express**: Handles API endpoints and novel PDF file serving
- **SQLite3**: Database to store novel metadata (filename, title, description, author info, file size, dates)
- **Docker**: Containerized application with separate services for nginx and backend

## Project Structure

```
hw3/
├── backend/                    # Node.js Express backend
│   ├── Dockerfile
│   ├── server.js              # Main Express server
│   ├── package.json
│   ├── pdfs/                  # Folder for novel PDF files
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
│       ├── pdfs.html          # Novel collection page
│       └── style.css          # Professional stylesheet with literary theme
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
- `/style.css` - Professional stylesheet with literary-themed design

### API Routes (Proxied to Backend)
- `GET /api/pdfs` - Returns JSON array of all novels with metadata (title, description, author info, etc.)
- `GET /health` - Health check endpoint
- `GET /pdf/:filename` - Serves individual novel PDF files

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

### Step 2: Set Up Novels Folder

Create the PDFs directory and add your novel PDF files:

```bash
mkdir -p backend/pdfs
# Copy your novel PDF files into backend/pdfs/
# Example: cp ~/novels/*.pdf backend/pdfs/
```

**Note**: The application is designed for classic novels and literary works. PDFs are automatically discovered and added to the database on server startup.

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

2. **Check backend logs for novel sync:**
   ```bash
   docker logs backend-nodejs
   ```
   You should see messages about novels being discovered and added to the database.

3. **Access the application:**
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

### Step 7: Update Novel Descriptions (Optional)

To update novel descriptions and metadata, use the provided script:

```bash
node update-description.js "filename.pdf" "Your description here"
```

**Example:**
```bash
node update-description.js "Moby_Dick.pdf" "A classic American novel by Herman Melville about Captain Ahab's obsessive quest for revenge against the white whale Moby Dick. Published in 1851, this epic tale explores themes of obsession, revenge, and man's struggle against nature."
```

**Note**: You can update descriptions for any novel in the collection to provide more detailed information about the literary work, author, themes, and historical significance.

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



