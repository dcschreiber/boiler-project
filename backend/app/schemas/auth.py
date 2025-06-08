from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: dict


class TokenData(BaseModel):
    user_id: str


class Login(BaseModel):
    email: EmailStr
    password: str


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    password: str