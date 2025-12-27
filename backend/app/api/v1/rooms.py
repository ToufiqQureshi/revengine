"""
Rooms Router
Room types CRUD operations.
Rooms page ke liye endpoints.
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, DbSession
from app.models.room import RoomType, RoomTypeCreate, RoomTypeRead, RoomTypeUpdate

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("", response_model=List[RoomTypeRead])
async def get_rooms(current_user: CurrentUser, session: DbSession):
    """
    Hotel ke saare room types get karo.
    Rooms page mein list display ke liye.
    """
    result = await session.execute(
        select(RoomType).where(RoomType.hotel_id == current_user.hotel_id)
    )
    rooms = result.scalars().all()
    return rooms


@router.post("", response_model=RoomTypeRead, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomTypeCreate,
    current_user: CurrentUser,
    session: DbSession
):
    """
    New room type create karo.
    Add Room form submit hone par.
    """
    room = RoomType(
        **room_data.model_dump(),
        hotel_id=current_user.hotel_id
    )
    session.add(room)
    await session.commit()
    await session.refresh(room)
    return room


@router.get("/{room_id}", response_model=RoomTypeRead)
async def get_room(room_id: str, current_user: CurrentUser, session: DbSession):
    """Single room type get karo"""
    result = await session.execute(
        select(RoomType).where(
            RoomType.id == room_id,
            RoomType.hotel_id == current_user.hotel_id
        )
    )
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room type not found"
        )
    return room


@router.patch("/{room_id}", response_model=RoomTypeRead)
async def update_room(
    room_id: str,
    room_update: RoomTypeUpdate,
    current_user: CurrentUser,
    session: DbSession
):
    """Room type update karo"""
    result = await session.execute(
        select(RoomType).where(
            RoomType.id == room_id,
            RoomType.hotel_id == current_user.hotel_id
        )
    )
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room type not found"
        )
    
    update_data = room_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)
    
    room.updated_at = datetime.utcnow()
    session.add(room)
    await session.commit()
    await session.refresh(room)
    
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_id: str, current_user: CurrentUser, session: DbSession):
    """Room type delete karo"""
    result = await session.execute(
        select(RoomType).where(
            RoomType.id == room_id,
            RoomType.hotel_id == current_user.hotel_id
        )
    )
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room type not found"
        )
    
    await session.delete(room)
    await session.commit()
