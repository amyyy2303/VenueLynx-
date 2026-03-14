"""
Venues router for venue management and retrieval.
Handles all venue-related operations.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Venue, VenueStatus
from app.schemas.schemas import (
    VenueCreate, VenueUpdate, VenueResponse, MessageResponse
)
from app.auth.auth import get_current_user, require_admin
from app.models.models import User
from app.services.services import VenueService

router = APIRouter(prefix="/api/venues", tags=["Venues"])


@router.get("", response_model=List[VenueResponse])
def get_venues(
    search: Optional[str] = Query(None, description="Search query for venue name"),
    venue_type: Optional[str] = Query(None, description="Filter by venue type"),
    min_capacity: Optional[int] = Query(None, description="Minimum capacity filter"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all venues with optional filters.
    
    Retrieves a list of venues based on optional filter criteria.
    
    Args:
        search: Optional search query for venue name or description
        venue_type: Optional filter by venue type
        min_capacity: Optional minimum capacity filter
        status: Optional status filter
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of venues matching the criteria
    """
    query = db.query(Venue)
    
    # Apply filters
    if search:
        query = query.filter(
            (Venue.name.ilike(f"%{search}%")) |
            (Venue.description.ilike(f"%{search}%"))
        )
    
    if venue_type:
        query = query.filter(Venue.type == venue_type)
    
    if min_capacity:
        query = query.filter(Venue.capacity >= min_capacity)
    
    if status:
        try:
            status_enum = VenueStatus(status)
            query = query.filter(Venue.status == status_enum)
        except ValueError:
            pass
    
    venues = query.order_by(Venue.name).all()
    return [VenueResponse.model_validate(venue) for venue in venues]


@router.get("/types", response_model=List[str])
def get_venue_types(db: Session = Depends(get_db)):
    """
    Get all unique venue types.
    
    Returns a list of all distinct venue types in the system.
    
    Args:
        db: Database session
        
    Returns:
        List of unique venue types
    """
    return VenueService.get_venue_types(db)


@router.get("/category/{venue_type}", response_model=List[VenueResponse])
def get_venues_by_category(
    venue_type: str,
    db: Session = Depends(get_db)
):
    """
    Get venues by category/type.
    
    Retrieves all venues of a specific type.
    
    Args:
        venue_type: Type of venue to retrieve
        db: Database session
        
    Returns:
        List of venues of the specified type
    """
    venues = db.query(Venue).filter(Venue.type == venue_type).all()
    return [VenueResponse.model_validate(venue) for venue in venues]


@router.get("/{venue_id}", response_model=VenueResponse)
def get_venue(
    venue_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific venue by ID.
    
    Retrieves detailed information about a specific venue.
    
    Args:
        venue_id: ID of the venue to retrieve
        db: Database session
        
    Returns:
        Venue details
        
    Raises:
        HTTPException: If venue is not found
    """
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    return VenueResponse.model_validate(venue)


@router.post("", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
def create_venue(
    venue_data: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new venue (Admin only).
    
    Creates a new venue with the provided information.
    Requires admin privileges.
    
    Args:
        venue_data: Venue creation data
        db: Database session
        current_user: Current admin user
        
    Returns:
        Created venue information
    """
    # Check if venue name already exists
    existing_venue = db.query(Venue).filter(Venue.name == venue_data.name).first()
    if existing_venue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Venue with this name already exists"
        )
    
    new_venue = Venue(
        name=venue_data.name,
        type=venue_data.type,
        capacity=venue_data.capacity,
        facilities=venue_data.facilities,
        description=venue_data.description,
        status=venue_data.status,
        location=venue_data.location,
        image_url=venue_data.image_url
    )
    
    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)
    
    return VenueResponse.model_validate(new_venue)


@router.put("/{venue_id}", response_model=VenueResponse)
def update_venue(
    venue_id: int,
    venue_data: VenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update a venue (Admin only).
    
    Updates an existing venue with the provided information.
    Requires admin privileges.
    
    Args:
        venue_id: ID of the venue to update
        venue_data: Venue update data
        db: Database session
        current_user: Current admin user
        
    Returns:
        Updated venue information
        
    Raises:
        HTTPException: If venue is not found
    """
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    # Update fields if provided
    update_dict = venue_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(venue, key, value)
    
    db.commit()
    db.refresh(venue)
    
    return VenueResponse.model_validate(venue)


@router.delete("/{venue_id}", response_model=MessageResponse)
def delete_venue(
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a venue (Admin only).
    
    Deletes a venue from the system.
    Requires admin privileges.
    
    Args:
        venue_id: ID of the venue to delete
        db: Database session
        current_user: Current admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If venue is not found or has active bookings
    """
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    # Check for active bookings
    from app.models.models import Booking, BookingStatus
    active_bookings = db.query(Booking).filter(
        Booking.venue_id == venue_id,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
    ).count()
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete venue with active bookings"
        )
    
    db.delete(venue)
    db.commit()
    
    return MessageResponse(message="Venue deleted successfully")


@router.get("/{venue_id}/availability")
def check_venue_availability(
    venue_id: int,
    date: str = Query(..., description="Date to check (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Check venue availability for a specific date.
    
    Returns all bookings for the venue on the specified date.
    
    Args:
        venue_id: ID of the venue
        date: Date to check availability
        db: Database session
        
    Returns:
        Dictionary with availability information
    """
    from datetime import datetime as dt
    from app.models.models import Booking, BookingStatus
    
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    try:
        check_date = dt.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    bookings = db.query(Booking).filter(
        Booking.venue_id == venue_id,
        Booking.event_date == check_date,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
    ).all()
    
    booked_slots = [
        {
            "start_time": booking.start_time,
            "end_time": booking.end_time,
            "event_name": booking.event_name,
            "status": booking.status.value
        }
        for booking in bookings
    ]
    
    return {
        "venue_id": venue_id,
        "venue_name": venue.name,
        "date": date,
        "is_available": venue.status == VenueStatus.AVAILABLE,
        "booked_slots": booked_slots
    }
