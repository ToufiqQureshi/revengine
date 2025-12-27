"""
Availability Router
Real-time room inventory calculation.
"""
from typing import List, Dict, Any
from datetime import date, timedelta, datetime
from fastapi import APIRouter, Query, Depends
from sqlmodel import select, and_, or_

from app.api.deps import CurrentUser, DbSession
from app.models.room import RoomType
from app.models.booking import Booking, BookingStatus

router = APIRouter(prefix="/availability", tags=["Availability"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_availability(
    current_user: CurrentUser,
    session: DbSession,
    start_date: date = Query(...),
    end_date: date = Query(...)
):
    """
    Calculate daily availability for all room types.
    Returns: List of room types with their daily availability.
    """
    # 1. Get all room types
    room_types_result = await session.execute(
        select(RoomType).where(RoomType.hotel_id == current_user.hotel_id)
    )
    room_types = room_types_result.scalars().all()
    
    # 2. Get overlapping bookings
    # Status should NOT be cancelled
    bookings_result = await session.execute(
        select(Booking).where(
            Booking.hotel_id == current_user.hotel_id,
            Booking.status != BookingStatus.CANCELLED,
            or_(
                and_(Booking.check_in <= end_date, Booking.check_out > start_date)
            )
        )
    )
    bookings = bookings_result.scalars().all()
    
    # 3. Generate date range
    delta = (end_date - start_date).days
    date_range = [start_date + timedelta(days=i) for i in range(delta + 1)]
    
    # 4. Calculate availability
    availability_data = []
    
    for room in room_types:
        room_data = {
            "id": room.id,
            "name": room.name,
            "totalInventory": room.total_inventory,
            "availability": []
        }
        
        for day in date_range:
            # Count booked rooms for this room type on this day
            booked_count = 0
            for booking in bookings:
                # Check if booking covers this day
                # Booking includes check_in, excludes check_out (generally)
                # Logic: check_in <= day < check_out
                if booking.check_in <= day < booking.check_out:
                    # Count how many rooms of this type are in this booking
                    for booked_room in booking.rooms:
                        if booked_room.get("room_type_id") == room.id:
                            booked_count += 1
            
            # Simple simulation for "blocked" if needed, or add BlockedDates table later
            # For now, just inventory - booked
            available = max(0, room.total_inventory - booked_count)
            is_blocked = False # Placeholder for maintenance blocks
            
            room_data["availability"].append({
                "date": day.isoformat(),
                "totalRooms": room.total_inventory,
                "bookedRooms": booked_count,
                "availableRooms": available,
                "isBlocked": is_blocked
            })
            
        availability_data.append(room_data)
        
    return availability_data
