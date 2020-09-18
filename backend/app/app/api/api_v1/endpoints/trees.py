import os
import uuid
from typing import Any, List

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    BackgroundTasks
)
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
from app.tasks import import_geofile

import logging
router = APIRouter()

def get_tree_if_authorized(db: Session, current_user: models.User, tree_id: int):
    '''Returns a tree if it exists and the user has access rights to it'''
    tree_in_db = crud.crud_tree.tree.get(db, tree_id)
    
    if not tree_in_db:
        raise HTTPException(status_code=404, detail='Tree does not exist')

    if tree_in_db.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail='Cannot request a tree that does not belong to your organization')

    return tree_in_db


@router.post("/import-from-geofile", response_model=schemas.GeoFile)
def import_from_geofile(
    *,
    db: Session = Depends(deps.get_db),
    name: str,
    current_user: models.User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks
) -> Any:
    """
    import trees from geofile 
    """
    geofile = crud.geo_file.get_by_name(db, name=name)

    if not geofile:
        raise HTTPException(status_code=404, detail=f"{name} not found")

    if not geofile.crs:
        raise HTTPException(status_code=415, detail='crs not found')

    if geofile.driver in ['xlsx', 'xls', 'csv']:
        if not geofile.longitude_column:
            raise HTTPException(status_code=415, detail='longitude_column not found')

        if not geofile.latitude_column:
            raise HTTPException(status_code=415, detail='latitude_column not found')

    if geofile.status == models.GeoFileStatus.IMPORTING:
        raise HTTPException(
            status_code=409,
            detail=f"{geofile.name} has already started an import process")

    background_tasks.add_task(
        import_geofile,
        db=db,
        geofile=geofile
    )

    return geofile

@router.get('/{tree_id}', response_model=schemas.tree.Tree_xy)
def get(
    tree_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models = Depends(deps.get_current_active_user)
) -> Any:
    """Gets a tree"""
    return get_tree_if_authorized(db, current_user, tree_id).to_xy()

@router.post('/', response_model=schemas.tree.Tree_xy)
def add(
    *,
    db: Session = Depends(deps.get_db),
    tree: schemas.TreePost,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Manual tree registration"""
    tree_with_user_info = schemas.TreeCreate(
        scientific_name = tree.scientific_name,
        geom=f'POINT({tree.x} {tree.y})',
        properties=None,
        user_id=current_user.id,
        organization_id=current_user.organization_id)
    
    return crud.crud_tree.tree.create(db, obj_in=tree_with_user_info).to_xy()

@router.patch('/{tree_id}', response_model=schemas.tree.Tree_xy)
def update(
    tree_id: int,
    *,
    db: Session = Depends(deps.get_db),
    update_data: schemas.tree.TreePatch,
    current_user: models = Depends(deps.get_current_active_user)
) -> Any:
    """Update tree info"""
    tree_in_db = get_tree_if_authorized(db, current_user, tree_id)
    json_data: dict = jsonable_encoder(update_data)

    return crud.crud_tree.tree.update(
        db,
        db_obj=tree_in_db,
        obj_in=dict({
            key: json_data[key] for key in json_data if key not in ('x','y')
            },
            **(dict(geom = f"POINT({json_data['x']} {json_data['y']})") if json_data['x'] is not None and json_data['y'] is not None else dict())
        )
        
    ).to_xy()

@router.delete('/{tree_id}', response_model=schemas.tree.Tree_xy)
def delete(
    tree_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models = Depends(deps.get_current_active_user)
) -> Any:
    """Deletes a tree"""
    if get_tree_if_authorized(db, current_user, tree_id):
        logging.info(f'tree id {tree_id}')
        return crud.crud_tree.tree.remove(db, id = tree_id).to_xy()