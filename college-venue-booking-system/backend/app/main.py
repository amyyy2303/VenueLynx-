"""
Smart College Venue Booking System - Main Application
FastAPI backend with MySQL database and JWT authentication.

This is the entry point for the application.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager
import os
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import APP_NAME, APP_VERSION, ALLOWED_ORIGINS
from app.database import init_db, engine, Base
from app.routers import auth, venues, bookings, admin
from app.init_data import initialize_data




@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    Initializes the database and sample data on startup.
    """
    # Startup: Create tables and initialize data
    print("Starting up Smart College Venue Booking System...")
    print("Creating database tables...")
    init_db()
    print("Database tables created successfully.")
    
    # Initialize sample data
    print("Initializing sample data...")
    initialize_data()
    print("Sample data initialized successfully.")
    
    yield
    
    # Shutdown: Clean up resources if needed
    print("Shutting down Smart College Venue Booking System...")


# Create FastAPI application
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="""
    A comprehensive venue booking system for college campuses.
    
    ## Features
    - User authentication with JWT tokens
    - Role-based access control (Student, Faculty, Admin)
    - Venue management and search
    - Booking request submission and tracking
    - Admin dashboard for booking approval
    - Conflict detection for venue bookings
    - Event schedule display
    
    ## User Roles
    - **Student**: View venues, submit booking requests, track booking status
    - **Faculty**: Same as student with potential additional privileges
    - **Admin**: Full access to manage venues, approve/reject bookings, view statistics
    """,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the frontend directory path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Mount static files
static_dir = os.path.join(FRONTEND_DIR, "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates_dir = os.path.join(FRONTEND_DIR, "templates")
templates = Jinja2Templates(directory=templates_dir)


# Include API routers
app.include_router(auth.router)
app.include_router(venues.router)
app.include_router(bookings.router)
app.include_router(admin.router)


# Serve frontend pages
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the home page."""
    index_path = os.path.join(FRONTEND_DIR, "templates", "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Welcome to Smart College Venue Booking System</h1>")


@app.get("/{page_name}.html", response_class=HTMLResponse)
async def serve_page(page_name: str):
    """Serve HTML pages from templates directory."""
    page_path = os.path.join(FRONTEND_DIR, "templates", f"{page_name}.html")
    if os.path.exists(page_path):
        with open(page_path, "r") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content=f"<h1>Page {page_name} not found</h1>", status_code=404)


# Health check endpoint
@app.get("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "app_name": APP_NAME,
        "version": APP_VERSION
    }


# API information endpoint
@app.get("/api/info")
def api_info():
    """Get API information."""
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "endpoints": {
            "auth": {
                "register": "POST /api/auth/register",
                "login": "POST /api/auth/login",
                "me": "GET /api/auth/me"
            },
            "venues": {
                "list": "GET /api/venues",
                "get": "GET /api/venues/{id}",
                "by_category": "GET /api/venues/category/{type}",
                "availability": "GET /api/venues/{id}/availability"
            },
            "bookings": {
                "create": "POST /api/bookings",
                "my_bookings": "GET /api/bookings/my",
                "all_bookings": "GET /api/bookings/all",
                "schedule": "GET /api/bookings/schedule"
            },
            "admin": {
                "dashboard": "GET /api/admin/dashboard",
                "pending_bookings": "GET /api/admin/pending-bookings",
                "approve": "PUT /api/admin/bookings/{id}/approve",
                "reject": "PUT /api/admin/bookings/{id}/reject"
            }
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[os.path.dirname(__file__)]
    )
