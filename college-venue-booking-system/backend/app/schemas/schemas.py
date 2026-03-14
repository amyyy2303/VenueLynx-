"""
Pydantic schemas for request and response validation.
This module defines all data transfer objects (DTOs) for the API.
"""

from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum


# Enums for schemas
class UserRoleEnum(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class VenueStatusEnum(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    MAINTENANCE = "maintenance"


class BookingStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


# ============= User Schemas =============

class UserBase(BaseModel):
    """Base schema for user data."""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=6, max_length=50)
    role: UserRoleEnum = UserRoleEnum.STUDENT


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response data."""
    id: int
    role: UserRoleEnum
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    department: Optional[str] = Field(None, max_length=100)


# ============= Token Schemas =============

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# ============= Venue Schemas =============

class VenueBase(BaseModel):
    """Base schema for venue data."""
    name: str = Field(..., min_length=2, max_length=100)
    type: str = Field(..., max_length=50)
    capacity: int = Field(..., gt=0)
    facilities: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None


class VenueCreate(VenueBase):
    """Schema for creating a new venue."""
    status: VenueStatusEnum = VenueStatusEnum.AVAILABLE


class VenueUpdate(BaseModel):
    """Schema for updating venue information."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    type: Optional[str] = Field(None, max_length=50)
    capacity: Optional[int] = Field(None, gt=0)
    facilities: Optional[str] = None
    description: Optional[str] = None
    status: Optional[VenueStatusEnum] = None
    location: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None


class VenueResponse(VenueBase):
    """Schema for venue response data."""
    id: int
    status: VenueStatusEnum
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= Equipment Request Schemas =============

class EquipmentRequestBase(BaseModel):
    """Base schema for equipment request."""
    equipment_name: str = Field(..., max_length=100)
    quantity: int = Field(1, gt=0)


class EquipmentRequestCreate(EquipmentRequestBase):
    """Schema for creating an equipment request."""
    pass


class EquipmentRequestResponse(EquipmentRequestBase):
    """Schema for equipment request response."""
    id: int
    booking_id: int
    
    class Config:
        from_attributes = True


# ============= Booking Schemas =============

class BookingBase(BaseModel):
    """Base schema for booking data."""
    venue_id: int
    event_name: str = Field(..., min_length=3, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    event_date: date
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    participants: int = Field(..., gt=0)
    purpose: Optional[str] = None
    
    @validator('end_time')
    def validate_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v


class BookingCreate(BookingBase):
    """Schema for creating a new booking."""
    equipment_requests: Optional[List[EquipmentRequestCreate]] = []


class BookingUpdate(BaseModel):
    """Schema for updating booking information."""
    event_name: Optional[str] = Field(None, min_length=3, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    event_date: Optional[date] = None
    start_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    end_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    participants: Optional[int] = Field(None, gt=0)
    purpose: Optional[str] = None


class BookingResponse(BookingBase):
    """Schema for booking response data."""
    id: int
    user_id: int
    status: BookingStatusEnum
    admin_remarks: Optional[str] = None
    created_at: datetime
    venue: VenueResponse
    equipment_requests: List[EquipmentRequestResponse] = []
    
    class Config:
        from_attributes = True


class BookingWithUserResponse(BookingResponse):
    """Schema for booking response with user information."""
    user: UserResponse
    
    class Config:
        from_attributes = True


class BookingApproval(BaseModel):
    """Schema for booking approval/rejection."""
    admin_remarks: Optional[str] = None


# ============= Statistics Schemas =============

class VenueStatistics(BaseModel):
    """Schema for venue statistics."""
    total_venues: int
    available_venues: int
    total_bookings: int
    pending_bookings: int
    approved_bookings: int
    rejected_bookings: int
    bookings_by_venue_type: dict
    recent_bookings: List[BookingWithUserResponse]


# ============= Response Schemas =============

class MessageResponse(BaseModel):
    """Schema for simple message response."""
    message: str
    success: bool = True


class PaginatedResponse(BaseModel):
    """Schema for paginated response."""
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
