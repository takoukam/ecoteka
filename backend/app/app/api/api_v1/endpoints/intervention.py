from fastapi import APIRouter, Depends, HTTPException
from app.schemas import Intervention, InterventionCreate, InterventionUpdate
from app import crud
from app.api import get_db
from app.core import authorization, set_policies

from sqlalchemy.orm import Session
from typing import List

router = APIRouter()

policies = {
    "interventions:create": ["owner", "manager", "contributor"],
    "interventions:get": ["owner", "manager", "contributor", "reader"],
    "interventions:get_year": ["owner", "manager", "contributor", "reader"],
    "interventions:update": ["owner", "manager", "contributor"],
    "interventions:delete": ["owner", "manager", "contributor"],
}
set_policies(policies)


@router.post("", response_model=Intervention)
def create(
    organization_id: int,
    *,
    auth=Depends(authorization("interventions:create")),
    request_intervention: InterventionCreate,
    db: Session = Depends(get_db),
):
    request_intervention.organization_id = organization_id
    return crud.intervention.create(db, obj_in=request_intervention)


@router.get("/{intervention_id}", response_model=Intervention)
def get(
    intervention_id: int,
    *,
    auth=Depends(authorization("interventions:get")),
    db: Session = Depends(get_db),
):
    return crud.intervention.get(db, id=intervention_id)


@router.get("",
    dependencies=[Depends(authorization("interventions:get_year"))], 
    response_model=List[Intervention])
def get_all_interventions(
    organization_id: int,
    *,
    db: Session = Depends(get_db),
):
    return crud.intervention.get_by_organization(db, organization_id=organization_id)


@router.patch(
    "/{intervention_id}", 
    response_model=Intervention,
    dependencies=[Depends(authorization("interventions:update"))])
def update(
    intervention_id: int,
    *,
    request_intervention: InterventionUpdate,
    db: Session = Depends(get_db),
):
    intervention_in_db = crud.intervention.get(db, id=intervention_id)

    if not intervention_in_db:
        raise HTTPException(status_code=404, detail="Intervention not found")

    print(request_intervention.dict())


    return crud.intervention.update(
        db, db_obj=intervention_in_db, obj_in=request_intervention
    )


@router.delete("/{intervention_id}", response_model=Intervention)
def delete(
    id: int,
    *,
    auth=Depends(authorization("interventions:delete")),
    db: Session = Depends(get_db),
):
    return crud.intervention.remove(db, id=id)
