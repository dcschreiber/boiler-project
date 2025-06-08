from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.core.database import get_db

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "backend-api"
    }


@router.get("/health/detailed")
async def detailed_health_check(db = Depends(get_db)) -> Dict[str, Any]:
    """Detailed health check including database connection"""
    health_status = {
        "status": "healthy",
        "service": "backend-api",
        "database": "disconnected"
    }
    
    try:
        # Test database connection
        result = await db.table("profiles").select("id").limit(1).execute()
        health_status["database"] = "connected"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database_error"] = str(e)
    
    return health_status