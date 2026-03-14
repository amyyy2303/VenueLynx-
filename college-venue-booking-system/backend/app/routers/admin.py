"""
Admin router for administrative operations.
Handles booking approvals, venue management, and statistics.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Booking, Venue, User, BookingStatus, UserRole
from app.schemas.schemas import (
    BookingApproval, BookingWithUserResponse, MessageResponse
)
from app.auth.auth import require_admin
from app.models.models import User
from app.services.services import StatisticsService

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get dashboard statistics for admin panel.
    
    Returns various statistics including venue counts, booking counts,
    and recent activity.
    
    Args:
        db: Database session
        current_user: Current admin user
        
    Returns:
        Dictionary containing dashboard statistics
    """
    stats = StatisticsService.get_dashboard_statistics(db)
    
    # Convert recent bookings to response format
    recent_bookings_response = [
        BookingWithUserResponse.model_validate(booking)
        for booking in stats["recent_bookings"]
    ]
    
    return {
        "total_venues": stats["total_venues"],
        "available_venues": stats["available_venues"],
        "total_bookings": stats["total_bookings"],
        "pending_bookings": stats["pending_bookings"],
        "approved_bookings": stats["approved_bookings"],
        "rejected_bookings": stats["rejected_bookings"],
        "bookings_by_venue_type": stats["bookings_by_venue_type"],
        "recent_bookings": recent_bookings_response
    }


@router.get("/pending-bookings", response_model=List[BookingWithUserResponse])
def get_pending_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get all pending booking requests.
    
    Retrieves all bookings waiting for approval.
    
    Args:
        db: Database session
        current_user: Current admin user
        
    Returns:
        List of pending bookings with user information
    """
    bookings = db.query(Booking).filter(
        Booking.status == BookingStatus.PENDING
    ).order_by(Booking.created_at).all()
    
    return [BookingWithUserResponse.model_validate(booking) for booking in bookings]


@router.put("/bookings/{booking_id}/approve", response_model=MessageResponse)
def approve_booking(
    booking_id: int,
    approval_data: BookingApproval = BookingApproval(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Approve a pending booking.
    
    Updates the booking status to approved and optionally adds admin remarks.
    
    Args:
        booking_id: ID of the booking to approve
        approval_data: Optional admin remarks
        db: Database session
        current_user: Current admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If booking not found or cannot be approved
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be approved"
        )
    
    booking.status = BookingStatus.APPROVED
    if approval_data.admin_remarks:
        booking.admin_remarks = approval_data.admin_remarks
    
    db.commit()
    
    return MessageResponse(message="Booking approved successfully")


@router.put("/bookings/{booking_id}/reject", response_model=MessageResponse)
def reject_booking(
    booking_id: int,
    approval_data: BookingApproval = BookingApproval(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Reject a pending booking.
    
    Updates the booking status to rejected and optionally adds admin remarks.
    
    Args:
        booking_id: ID of the booking to reject
        approval_data: Optional admin remarks
        db: Database session
        current_user: Current admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If booking not found or cannot be rejected
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be rejected"
        )
    
    booking.status = BookingStatus.REJECTED
    if approval_data.admin_remarks:
        booking.admin_remarks = approval_data.admin_remarks
    
    db.commit()
    
    return MessageResponse(message="Booking rejected successfully")


@router.get("/users")
def get_all_users(
    role: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get all users with optional role filter.
    
    Retrieves a list of all users in the system.
    
    Args:
        role: Optional role filter
        db: Database session
        current_user: Current admin user
        
    Returns:
        List of users
    """
    query = db.query(User)
    
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            pass
    
    users = query.order_by(User.created_at.desc()).all()
    
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "department": user.department,
            "created_at": user.created_at.isoformat()
        }
        for user in users
    ]


@router.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a booking (Admin only).
    
    Permanently removes a booking from the system.
    
    Args:
        booking_id: ID of the booking to delete
        db: Database session
        current_user: Current admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If booking not found
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    db.delete(booking)
    db.commit()
    
    return {"message": "Booking deleted successfully", "success": True}


@router.get("/reports/venue-utilization")
def get_venue_utilization_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get venue utilization report.
    
    Returns utilization statistics for all venues.
    
    Args:
        db: Database session
        current_user: Current admin user
        
    Returns:
        List of venue utilization statistics
    """
    venues = db.query(Venue).all()
    
    utilization_data = []
    for venue in venues:
        stats = StatisticsService.get_venue_utilization(db, venue.id)
        utilization_data.append({
            "venue_id": venue.id,
            "venue_name": venue.name,
            "venue_type": venue.type,
            "capacity": venue.capacity,
            "total_bookings": stats.get("total_bookings", 0),
            "this_month_bookings": stats.get("this_month_bookings", 0)
        })
    
    # Sort by total bookings descending
    utilization_data.sort(key=lambda x: x["total_bookings"], reverse=True)
    
    return utilization_data


@router.get("/reports/monthly-bookings")
def get_monthly_bookings_report(
    year: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get monthly bookings report.
    
    Returns booking counts grouped by month.
    
    Args:
        year: Optional year filter (defaults to current year)
        db: Database session
        current_user: Current admin user
        
    Returns:
        Monthly booking statistics
    """
    from sqlalchemy import func, extract
    from datetime import datetime
    
    if not year:
        year = datetime.now().year
    
    # Query bookings grouped by month
    monthly_stats = db.query(
        extract('month', Booking.event_date).label('month'),
        func.count(Booking.id).label('total'),
        func.sum(func.IF(Booking.status == BookingStatus.APPROVED, 1, 0)).label('approved'),
        func.sum(func.IF(Booking.status == BookingStatus.REJECTED, 1, 0)).label('rejected'),
        func.sum(func.IF(Booking.status == BookingStatus.PENDING, 1, 0)).label('pending')
    ).filter(
        extract('year', Booking.event_date) == year
    ).group_by(
        extract('month', Booking.event_date)
    ).all()
    
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    
    result = []
    for stat in monthly_stats:
        month_idx = int(stat.month) - 1
        result.append({
            "month": months[month_idx],
            "month_number": int(stat.month),
            "total": stat.total,
            "approved": int(stat.approved or 0),
            "rejected": int(stat.rejected or 0),
            "pending": int(stat.pending or 0)
        })
    
    return result
