from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    APP_NAME: str = "SaaS Boilerplate"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    API_URL: str = "http://localhost:8000"
    APP_URL: str = "http://localhost:5173"
    
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    ADMIN_EMAIL: str
    WHITELIST_MODE: bool = False
    
    CORS_ORIGINS: str = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        if self.CORS_ORIGINS:
            return [i.strip() for i in self.CORS_ORIGINS.split(",")]
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