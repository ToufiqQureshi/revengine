"""
Main Application Entry Point
FastAPI app initialization with all routers.
Production-ready with CORS, lifespan events.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db

# Import routers
from app.api.v1 import auth, users, hotels, rooms, bookings, dashboard, rates, payments, availability, reports, public, integration

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup aur shutdown events handle karta hai.
    Database tables create hote hain startup par.
    """
    # Startup: Database initialize karo
    print("Starting Hotelier Hub API...")
    await init_db()
    print("Database initialized successfully!")
    yield
    # Shutdown: Cleanup if needed
    print("Shutting down...")


# FastAPI app create karo
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-tenant Hotel Management API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware - Frontend ko allow karna hai
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Server health check"""
    return {"status": "healthy", "version": settings.APP_VERSION}


# API Version 1 routers include karo
API_V1_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(users.router, prefix=API_V1_PREFIX)
app.include_router(hotels.router, prefix=API_V1_PREFIX)
app.include_router(rooms.router, prefix=API_V1_PREFIX)
app.include_router(bookings.router, prefix=API_V1_PREFIX)
app.include_router(dashboard.router, prefix=API_V1_PREFIX)
app.include_router(rates.router, prefix=API_V1_PREFIX)
app.include_router(payments.router, prefix=API_V1_PREFIX)
app.include_router(availability.router, prefix=API_V1_PREFIX)
app.include_router(reports.router, prefix=API_V1_PREFIX)
app.include_router(public.router, prefix=API_V1_PREFIX)
app.include_router(integration.router, prefix=API_V1_PREFIX)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """API root - basic info"""
    return {
        "message": "Welcome to Hotelier Hub API",
        "docs": "/docs",
        "version": settings.APP_VERSION
    }
