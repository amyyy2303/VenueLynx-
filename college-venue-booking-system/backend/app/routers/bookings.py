"""
Bookings router for booking management.
Handles all booking-related operations for students and faculty.
"""

from typing import List, Optional
from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Booking, Venue, User, BookingStatus, EquipmentRequest
from app.schemas.schemas import (
    BookingCreate, BookingResponse, BookingWithUserResponse,
    BookingApproval, MessageResponse, EquipmentRequestCreate
)
from app.auth.auth import get_current_user
from app.services.services import BookingService

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new booking request.
    
    Submits a new booking request for a venue. Checks for conflicts
    before creating the booking.
    
    Args:
        booking_data: Booking creation data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created booking information
        
    Raises:
        HTTPException: If venue not found, conflict exists, or validation fails
    """
    # Check if venue exists
    venue = db.query(Venue).filter(Venue.id == booking_data.venue_id).first()
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    # Check capacity
    if booking_data.participants > venue.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Number of participants exceeds venue capacity ({venue.capacity})"
        )
    
    # Check for booking conflicts
    has_conflict, conflict_message = BookingService.check_booking_conflict(
        db=db,
        venue_id=booking_data.venue_id,
        event_date=booking_data.event_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time
    )
    
    if has_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=conflict_message
        )
    
    # Create booking
    new_booking = Booking(
        user_id=current_user.id,
        venue_id=booking_data.venue_id,
        event_name=booking_data.event_name,
        department=booking_data.department or current_user.department,
        event_date=booking_data.event_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        participants=booking_data.participants,
        purpose=booking_data.purpose
    )
    
    db.add(new_booking)
    db.flush()  # Get the booking ID
    
    # Add equipment requests if any
    for equipment in booking_data.equipment_requests:
        equipment_request = EquipmentRequest(
            booking_id=new_booking.id,
            equipment_name=equipment.equipment_name,
            quantity=equipment.quantity
        )
        db.add(equipment_request)
    
    db.commit()
    db.refresh(new_booking)
    
    return BookingResponse.model_validate(new_booking)


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's bookings.
    
    Retrieves all bookings made by the current authenticated user.
    
    Args:
        status_filter: Optional status filter
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of user's bookings
    """
    query = db.query(Booking).filter(Booking.user_id == current_user.id)
    
    if status_filter:
        try:
            status_enum = BookingStatus(status_filter)
            query = query.filter(Booking.status == status_enum)
        except ValueError:
            pass
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [BookingResponse.model_validate(booking) for booking in bookings]


@router.get("/all", response_model=List[BookingWithUserResponse])
def get_all_bookings(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    venue_id: Optional[int] = Query(None, description="Filter by venue"),
    start_date: Optional[date_type] = Query(None, description="Start date filter"),
    end_date: Optional[date_type] = Query(None, description="End date filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookings (for admin dashboard).
    
    Retrieves all bookings with optional filters.
    
    Args:
        status_filter: Optional status filter
        venue_id: Optional venue filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of all bookings
    """
    query = db.query(Booking)
    
    if status_filter:
        try:
            status_enum = BookingStatus(status_filter)
            query = query.filter(Booking.status == status_enum)
        except ValueError:
            pass
    
    if venue_id:
        query = query.filter(Booking.venue_id == venue_id)
    
    if start_date:
        query = query.filter(Booking.event_date >= start_date)
    
    if end_date:
        query = query.filter(Booking.event_date <= end_date)
    
    bookings = query.order_by(Booking.event_date, Booking.start_time).all()
    return [BookingWithUserResponse.model_validate(booking) for booking in bookings]


@router.get("/schedule", response_model=List[BookingWithUserResponse])
def get_event_schedule(
    limit: int = Query(20, ge=1, le=100, description="Number of events to return"),
    venue_id: Optional[int] = Query(None, description="Filter by venue"),
    db: Session = Depends(get_db)
):
    """
    Get upcoming approved events for schedule display.
    
    Retrieves upcoming approved events, optionally filtered by venue.
    
    Args:
        limit: Maximum number of events to return
        venue_id: Optional venue filter
        db: Database session
        
    Returns:
        List of upcoming approved events
    """
    today = date_type.today()
    query = db.query(Booking).filter(
        Booking.event_date >= today,
        Booking.status == BookingStatus.APPROVED
    )
    
    if venue_id:
        query = query.filter(Booking.venue_id == venue_id)
    
    bookings = query.order_by(Booking.event_date, Booking.start_time).limit(limit).all()
    return [BookingWithUserResponse.model_validate(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific booking by ID.
    
    Retrieves detailed information about a specific booking.
    
    Args:
        booking_id: ID of the booking to retrieve
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Booking details
        
    Raises:
        HTTPException: If booking is not found
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return BookingResponse.model_validate(booking)


@router.put("/{booking_id}/cancel", response_model=MessageResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a booking.
    
    Allows users to cancel their own pending bookings.
    
    Args:
        booking_id: ID of the booking to cancel
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If booking not found or cannot be cancelled
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user owns the booking
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings"
        )
    
    # Check if booking can be cancelled
    if booking.status not in [BookingStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be cancelled"
        )
    
    booking.status = BookingStatus.CANCELLED
    db.commit()
    
    return MessageResponse(message="Booking cancelled successfully")


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a booking.
    
    Allows users to update their own pending bookings.
    
    Args:
        booking_id: ID of the booking to update
        booking_data: Update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Updated booking information
        
    Raises:
        HTTPException: If booking not found or cannot be updated
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user owns the booking
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own bookings"
        )
    
    # Check if booking can be updated
    if booking.status not in [BookingStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be updated"
        )
    
    # Update allowed fields
    allowed_fields = [
        "event_name", "department", "event_date", 
        "start_time", "end_time", "participants", "purpose"
    ]
    
    for key, value in booking_data.items():
        if key in allowed_fields and value is not None:
            setattr(booking, key, value)
    
    # Check for conflicts if date/time changed
    if any(k in booking_data for k in ["event_date", "start_time", "end_time"]):
        has_conflict, conflict_message = BookingService.check_booking_conflict(
            db=db,
            venue_id=booking.venue_id,
            event_date=booking.event_date,
            start_time=booking.start_time,
            end_time=booking.end_time,
            exclude_booking_id=booking.id
        )
        
        if has_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=conflict_message
            )
    
    db.commit()
    db.refresh(booking)
    
    return BookingResponse.model_validate(booking)
