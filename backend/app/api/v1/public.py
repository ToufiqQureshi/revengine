
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlmodel import select, and_

from app.core.database import get_session
from app.api.deps import DbSession
from app.models.hotel import Hotel, HotelRead
from app.models.room import RoomType, RoomTypeRead
from app.models.booking import Booking

router = APIRouter(prefix="/public", tags=["Public"])

@router.get("/hotels/slug/{hotel_slug}", response_model=HotelRead)
async def get_public_hotel_by_slug(hotel_slug: str, session: DbSession):
    """
    Get hotel details by slug for public booking page.
    No authentication required.
    """
    query = select(Hotel).where(Hotel.slug == hotel_slug)
    result = await session.execute(query)
    hotel = result.scalar_one_or_none()
    
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

@router.get("/hotels/{hotel_id}", response_model=HotelRead)
async def get_public_hotel(hotel_id: str, session: DbSession):
    """
    Get hotel details for public booking page.
    No authentication required.
    """
    hotel = await session.get(Hotel, hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

@router.get("/hotels/{hotel_id}/rooms", response_model=List[RoomTypeRead])
async def search_public_rooms(
    hotel_id: str,
    session: DbSession,
    check_in: date = Query(...),
    check_out: date = Query(...),
    guests: int = Query(2)
):
    """
    Search available rooms for a hotel.
    Real availability check logic.
    """
    # 1. Get all room types for this hotel
    query = select(RoomType).where(
        RoomType.hotel_id == hotel_id,
        RoomType.is_active == True
    )
    result = await session.execute(query)
    room_types = result.scalars().all()
    
    if not room_types:
        return []

    # 2. Filter by occupancy
    available_rooms = []
    
    # Pre-fetch bookings for this range to calculate availability
    # This is a basic availability check. 
    # In a real system, you'd check day-by-day inventory.
    # Here we just check if "total_inventory - overlapping_bookings > 0"
    
    # Get bookings overlapping with requested dates for this hotel
    booking_query = select(Booking).where(
        Booking.hotel_id == hotel_id,
        Booking.status.in_(["confirmed", "checked_in"]),
        and_(
            Booking.check_in < check_out,
            Booking.check_out > check_in
        )
    )
    booking_result = await session.execute(booking_query)
    existing_bookings = booking_result.scalars().all()
    
    # Map bookings to room types
    # Booking schema has 'rooms' JSON which contains list of booked rooms
    # We need to count how many of specific room_type_id are taken
    
    booked_counts = {} # {room_type_id: count}
    
    for booking in existing_bookings:
        for r_booked in booking.rooms:
            # r_booked structure matches the JSON schema we saved: {room_type_id: ..., ...}
            rt_id = r_booked.get("room_type_id")
            if rt_id:
                booked_counts[rt_id] = booked_counts.get(rt_id, 0) + 1

    for rt in room_types:
        if rt.max_occupancy >= guests:
            # Check inventory
            taken = booked_counts.get(rt.id, 0)
            if rt.total_inventory > taken:
                available_rooms.append(rt)

    return available_rooms
