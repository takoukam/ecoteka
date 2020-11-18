from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# rom app import crud, models, schemas
from app.crud import user
from app.models import User
from app.schemas import (
    Msg,
    UserOut,
    Token
    # UserCreate
)
from app.api import (
    get_db,
    get_current_user
)
from app.core.security import get_password_hash
from app.utils import (
    generate_password_reset_token,
    send_reset_password_email,
    verify_password_reset_token,
    generate_response_for_token
)

router = APIRouter()


@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user_in_db = user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user_in_db:
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )

    return generate_response_for_token(
        user_id=user_in_db.id,
        is_superuser=user_in_db.is_superuser
    )


@router.post("/login/test-token", response_model=UserOut)
def test_token(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}", response_model=Msg)
def recover_password(email: str, db: Session = Depends(get_db)) -> Any:
    """
    Password Recovery
    """
    user_in_db = user.get_by_email(db, email=email)

    if not user_in_db:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    send_reset_password_email(
        email_to=user_in_db.email, email=email, token=password_reset_token
    )
    return {"msg": "Password recovery email sent"}


@router.post("/reset-password/", response_model=Msg)
def reset_password(
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password
    """
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user_in_db = user.get_by_email(db, email=email)
    if not user_in_db:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    hashed_password = get_password_hash(new_password)
    user_in_db.hashed_password = hashed_password
    db.add(user_in_db)
    db.commit()
    return {"msg": "Password updated successfully"}