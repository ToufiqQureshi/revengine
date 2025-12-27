"""
Room Models
RoomType, Amenity structures.
Frontend RoomType interface se match karta hai.
"""
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from app.models.hotel import Hotel
    from app.models.rates import RoomRate


class RoomPhoto(SQLModel):
    """Embedded photo object"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: Optional[str] = None
    sort_order: int = 0


class Amenity(SQLModel):
    """Embedded amenity object"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: Optional[str] = None
    category: Optional[str] = None


class RoomTypeBase(SQLModel):
    """Base room type fields - Frontend RoomType se match"""
    name: str
    description: Optional[str] = None
    base_occupancy: int = Field(default=2, ge=1)
    max_occupancy: int = Field(default=3, ge=1)
    max_children: int = Field(default=1, ge=0)
    extra_bed_allowed: bool = Field(default=False)
    base_price: float = Field(ge=0)
    total_inventory: int = Field(default=1, ge=0)
    is_active: bool = Field(default=True)


class RoomType(RoomTypeBase, table=True):
    """
    Database table for room types.
    Photos aur amenities JSON mein store hote hain.
    """
    __tablename__ = "room_types"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    hotel_id: str = Field(foreign_key="hotels.id", index=True)
    
    # JSON columns for arrays
    photos: List[dict] = Field(default_factory=list, sa_column=Column(JSON))
    amenities: List[dict] = Field(default_factory=list, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    rates: List["RoomRate"] = Relationship(back_populates="room_type")
    hotel: Optional["Hotel"] = Relationship(back_populates="room_types")


class RoomTypeCreate(RoomTypeBase):
    """Create room type schema"""
    photos: List[dict] = []
    amenities: List[dict] = []


class RoomTypeRead(RoomTypeBase):
    """Response schema - Frontend RoomType match"""
    id: str
    hotel_id: str
    photos: List[dict]
    amenities: List[dict]
    created_at: datetime
    updated_at: datetime


class RoomTypeUpdate(SQLModel):
    """Partial update"""
    name: Optional[str] = None
    description: Optional[str] = None
    base_occupancy: Optional[int] = None
    max_occupancy: Optional[int] = None
    base_price: Optional[float] = None
    total_inventory: Optional[int] = None
    is_active: Optional[bool] = None
    photos: Optional[List[dict]] = None
    amenities: Optional[List[dict]] = None
    max_children: Optional[int] = None
    extra_bed_allowed: Optional[bool] = None
