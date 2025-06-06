from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator


class Settings(BaseSettings):
    APP_NAME: str = "SaaS Boilerplate"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    API_URL: str = "http://localhost:8000"
    APP_URL: str = "http://localhost:5173"
    
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    ADMIN_EMAIL: str
    WHITELIST_MODE: bool = False
    
    CORS_ORIGINS: List[str] = []
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str) and v:
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return []
    
    STRIPE_ENABLED: bool = False
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRICE_ID_MONTHLY: Optional[str] = None
    STRIPE_PRICE_ID_YEARLY: Optional[str] = None
    
    SENTRY_DSN: Optional[str] = None
    
    RATE_LIMIT: str = "100/minute"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()