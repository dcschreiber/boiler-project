from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None


class User(UserBase):
    id: str
    is_admin: bool = False
    created_at: datetime
    language: Optional[str] = "en"

    class Config:
        from_attributes = True


class UserInDB(User):
    hashed_password: str


class UserList(BaseModel):
    users: list[User]
    total: int
    page: int
    per_page: int