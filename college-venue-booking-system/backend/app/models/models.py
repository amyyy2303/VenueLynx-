"""
Database models for the Smart College Venue Booking System.
This module defines all SQLAlchemy ORM models.
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Time, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """Enum for user roles in the system."""
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class VenueStatus(str, enum.Enum):
    """Enum for venue availability status."""
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    MAINTENANCE = "maintenance"


class BookingStatus(str, enum.Enum):
    """Enum for booking status."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class User(Base):
    """
    User model for storing user account information.
    Supports three roles: student, faculty, and admin.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = relationship("Booking", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', role='{self.role}')>"


class Venue(Base):
    """
    Venue model for storing venue information.
    Represents bookable spaces in the college.
    """
    __tablename__ = "venues"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)
    capacity = Column(Integer, nullable=False)
    facilities = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(VenueStatus), default=VenueStatus.AVAILABLE, nullable=False)
    location = Column(String(100), nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = relationship("Booking", back_populates="venue")
    
    def __repr__(self):
        return f"<Venue(id={self.id}, name='{self.name}', type='{self.type}', capacity={self.capacity})>"


class Booking(Base):
    """
    Booking model for storing booking requests.
    Tracks the booking status and related information.
    """
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False, index=True)
    event_name = Column(String(200), nullable=False)
    department = Column(String(100), nullable=True)
    event_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)
    participants = Column(Integer, nullable=False)
    purpose = Column(Text, nullable=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False, index=True)
    admin_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    venue = relationship("Venue", back_populates="bookings")
    equipment_requests = relationship("EquipmentRequest", back_populates="booking", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Booking(id={self.id}, event='{self.event_name}', status='{self.status}')>"


class EquipmentRequest(Base):
    """
    EquipmentRequest model for storing equipment requests associated with bookings.
    """
    __tablename__ = "equipment_requests"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    equipment_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    booking = relationship("Booking", back_populates="equipment_requests")
    
    def __repr__(self):
        return f"<EquipmentRequest(id={self.id}, equipment='{self.equipment_name}', quantity={self.quantity})>"
