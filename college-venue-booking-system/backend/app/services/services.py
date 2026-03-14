"""
Business logic services for the Smart College Venue Booking System.
This module contains core business logic including booking conflict detection.
"""

from datetime import date, datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.models import User, Venue, Booking, EquipmentRequest, BookingStatus, VenueStatus


class BookingService:
    """Service class for booking-related operations."""
    
    @staticmethod
    def check_booking_conflict(
        db: Session,
        venue_id: int,
        event_date: date,
        start_time: str,
        end_time: str,
        exclude_booking_id: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if a booking conflicts with existing bookings for the same venue.
        
        Args:
            db: Database session
            venue_id: ID of the venue to check
            event_date: Date of the event
            start_time: Start time in HH:MM format
            end_time: End time in HH:MM format
            exclude_booking_id: Optional booking ID to exclude from conflict check
            
        Returns:
            Tuple of (has_conflict, conflict_message)
        """
        # Query for existing bookings on the same date and venue
        query = db.query(Booking).filter(
            Booking.venue_id == venue_id,
            Booking.event_date == event_date,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
        )
        
        # Exclude current booking if updating
        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)
        
        existing_bookings = query.all()
        
        # Check for time conflicts
        for booking in existing_bookings:
            # Convert time strings to comparable format
            existing_start = booking.start_time
            existing_end = booking.end_time
            
            # Check for overlap
            # Conflict occurs if:
            # 1. New start time is between existing start and end
            # 2. New end time is between existing start and end
            # 3. New booking completely overlaps existing booking
            if (start_time < existing_end and end_time > existing_start):
                return True, (
                    f"Venue already booked for the selected time slot. "
                    f"Conflict with booking '{booking.event_name}' "
                    f"({existing_start} - {existing_end})."
                )
        
        return False, None
    
    @staticmethod
    def get_bookings_by_date_range(
        db: Session,
        start_date: date,
        end_date: date,
        venue_id: Optional[int] = None
    ) -> List[Booking]:
        """
        Get all bookings within a date range.
        
        Args:
            db: Database session
            start_date: Start date of range
            end_date: End date of range
            venue_id: Optional venue ID to filter by
            
        Returns:
            List of bookings within the date range
        """
        query = db.query(Booking).filter(
            Booking.event_date >= start_date,
            Booking.event_date <= end_date,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
        )
        
        if venue_id:
            query = query.filter(Booking.venue_id == venue_id)
        
        return query.order_by(Booking.event_date, Booking.start_time).all()
    
    @staticmethod
    def get_upcoming_events(db: Session, limit: int = 20) -> List[Booking]:
        """
        Get upcoming approved events.
        
        Args:
            db: Database session
            limit: Maximum number of events to return
            
        Returns:
            List of upcoming approved bookings
        """
        today = date.today()
        
        return db.query(Booking).filter(
            Booking.event_date >= today,
            Booking.status == BookingStatus.APPROVED
        ).order_by(Booking.event_date, Booking.start_time).limit(limit).all()


class VenueService:
    """Service class for venue-related operations."""
    
    @staticmethod
    def get_venues_by_type(db: Session, venue_type: str) -> List[Venue]:
        """
        Get all venues of a specific type.
        
        Args:
            db: Database session
            venue_type: Type of venue to filter by
            
        Returns:
            List of venues of the specified type
        """
        return db.query(Venue).filter(Venue.type == venue_type).all()
    
    @staticmethod
    def get_available_venues(db: Session) -> List[Venue]:
        """
        Get all available venues.
        
        Args:
            db: Database session
            
        Returns:
            List of available venues
        """
        return db.query(Venue).filter(Venue.status == VenueStatus.AVAILABLE).all()
    
    @staticmethod
    def search_venues(
        db: Session,
        query: str,
        venue_type: Optional[str] = None,
        min_capacity: Optional[int] = None,
        status: Optional[VenueStatus] = None
    ) -> List[Venue]:
        """
        Search venues by various criteria.
        
        Args:
            db: Database session
            query: Search query for venue name
            venue_type: Optional venue type filter
            min_capacity: Optional minimum capacity filter
            status: Optional status filter
            
        Returns:
            List of matching venues
        """
        base_query = db.query(Venue)
        
        if query:
            base_query = base_query.filter(
                or_(
                    Venue.name.ilike(f"%{query}%"),
                    Venue.description.ilike(f"%{query}%")
                )
            )
        
        if venue_type:
            base_query = base_query.filter(Venue.type == venue_type)
        
        if min_capacity:
            base_query = base_query.filter(Venue.capacity >= min_capacity)
        
        if status:
            base_query = base_query.filter(Venue.status == status)
        
        return base_query.all()
    
    @staticmethod
    def get_venue_types(db: Session) -> List[str]:
        """
        Get all unique venue types.
        
        Args:
            db: Database session
            
        Returns:
            List of unique venue types
        """
        return [row[0] for row in db.query(Venue.type).distinct().all()]


class StatisticsService:
    """Service class for generating statistics."""
    
    @staticmethod
    def get_dashboard_statistics(db: Session) -> dict:
        """
        Get statistics for the admin dashboard.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary containing various statistics
        """
        # Count totals
        total_venues = db.query(Venue).count()
        available_venues = db.query(Venue).filter(
            Venue.status == VenueStatus.AVAILABLE
        ).count()
        
        total_bookings = db.query(Booking).count()
        pending_bookings = db.query(Booking).filter(
            Booking.status == BookingStatus.PENDING
        ).count()
        approved_bookings = db.query(Booking).filter(
            Booking.status == BookingStatus.APPROVED
        ).count()
        rejected_bookings = db.query(Booking).filter(
            Booking.status == BookingStatus.REJECTED
        ).count()
        
        # Bookings by venue type
        bookings_by_type = {}
        venue_types = VenueService.get_venue_types(db)
        for vtype in venue_types:
            count = db.query(Booking).join(Venue).filter(
                Venue.type == vtype
            ).count()
            bookings_by_type[vtype] = count
        
        # Recent bookings
        recent_bookings = db.query(Booking).order_by(
            Booking.created_at.desc()
        ).limit(10).all()
        
        return {
            "total_venues": total_venues,
            "available_venues": available_venues,
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
            "approved_bookings": approved_bookings,
            "rejected_bookings": rejected_bookings,
            "bookings_by_venue_type": bookings_by_type,
            "recent_bookings": recent_bookings
        }
    
    @staticmethod
    def get_venue_utilization(db: Session, venue_id: int) -> dict:
        """
        Get utilization statistics for a specific venue.
        
        Args:
            db: Database session
            venue_id: ID of the venue
            
        Returns:
            Dictionary containing utilization statistics
        """
        venue = db.query(Venue).filter(Venue.id == venue_id).first()
        if not venue:
            return {}
        
        total_bookings = db.query(Booking).filter(
            Booking.venue_id == venue_id,
            Booking.status == BookingStatus.APPROVED
        ).count()
        
        today = date.today()
        this_month_bookings = db.query(Booking).filter(
            Booking.venue_id == venue_id,
            Booking.status == BookingStatus.APPROVED,
            Booking.event_date >= today.replace(day=1)
        ).count()
        
        return {
            "venue_name": venue.name,
            "total_bookings": total_bookings,
            "this_month_bookings": this_month_bookings
        }
