"""
Users Router
Current user profile aur management.
"""
from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.models.user import UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead)
async def get_current_user_profile(current_user: CurrentUser):
    """
    Get logged in user's profile.
    Frontend isko use karta hai auth state verify karne ke liye.
    """
    return current_user
