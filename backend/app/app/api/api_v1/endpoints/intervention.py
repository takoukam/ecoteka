from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException
)

from app import crud, models, schemas
from app.api import deps

from sqlalchemy.orm import Session

router = APIRouter()

@router.post('/', response_model=schemas.Intervention)
def create(
    *,
    request_intervention: schemas.InterventionCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return crud.intervention.create(db, obj_in=request_intervention)

@router.get('/{intervention_id}', response_model=schemas.Intervention)
def get(
    intervention_id: int,
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return crud.intervention.get(db, id = intervention_id)

@router.patch('/{intervention_id}', response_model=schemas.Intervention)
def update(
    intervention_id: int,
    *,
    request_intervention: schemas.InterventionUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return crud.intervention.update(
        db,
        db_obj=crud.intervention.get(db, id=intervention_id),
        obj_in=request_intervention
    )

@router.delete('/{intervention_id}', response_model=schemas.Intervention)
def delete(
    id: int,
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return crud.intervention.remove(db, id=id)