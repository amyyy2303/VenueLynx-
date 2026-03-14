"""
Authentication router for user registration and login.
Handles JWT token generation for authenticated users.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, Token, MessageResponse
)
from app.auth.auth import (
    hash_password, verify_password, create_access_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user with the provided information and returns an access token.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        Token with access token and user information
        
    Raises:
        HTTPException: If email is already registered
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
        department=user_data.department
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate access token
    access_token = create_access_token(
        data={
            "sub": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value
        }
    )
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token.
    
    Validates user credentials and returns a JWT token for authenticated requests.
    
    Args:
        login_data: User login credentials
        db: Database session
        
    Returns:
        Token with access token and user information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token
    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value
        }
    )
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Returns the profile of the currently authenticated user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User profile information
    """
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    
    Allows users to update their name and department.
    
    Args:
        update_data: Profile update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user profile information
    """
    if "name" in update_data and update_data["name"]:
        current_user.name = update_data["name"]
    
    if "department" in update_data:
        current_user.department = update_data["department"]
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)
