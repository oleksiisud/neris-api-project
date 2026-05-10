from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ValidationContext(BaseModel):
    context_type: str
    primary_object: Dict[str, Any]
    related_objects: List[Dict[str, Any]]
    comments: List[str]
    relevant_schema_rules: Optional[List[str]] = None

class ValidationRequest(BaseModel):
    base: Dict[str, Any]
    incident_types: List[Dict[str, Any]]
    dispatch: Dict[str, Any]
    special_modifiers: Optional[List[str]] = None
    aids: Optional[List[Dict[str, Any]]] = None
    nonfd_aids: Optional[List[str]] = None
    actions_tactics: Optional[Dict[str, Any]] = None
    tactic_timestamps: Optional[Dict[str, Any]] = None
    unit_responses: Optional[List[Dict[str, Any]]] = None
    exposures: Optional[List[Dict[str, Any]]] = None
    casualty_rescues: Optional[List[Dict[str, Any]]] = None
    fire_detail: Optional[Dict[str, Any]] = None
    hazsit_detail: Optional[Dict[str, Any]] = None
    medical_details: Optional[List[Dict[str, Any]]] = None
    smoke_alarm: Optional[Dict[str, Any]] = None
    fire_alarm: Optional[Dict[str, Any]] = None
    other_alarm: Optional[Dict[str, Any]] = None
    fire_suppression: Optional[Dict[str, Any]] = None
    cooking_fire_suppression: Optional[Dict[str, Any]] = None
    electric_hazards: Optional[List[Dict[str, Any]]] = None
    powergen_hazards: Optional[List[Dict[str, Any]]] = None
    csst_hazard: Optional[Dict[str, Any]] = None
    medical_oxygen_hazard: Optional[Dict[str, Any]] = None

    rules: Optional[List[str]] = None


class QueueResponse(BaseModel):
    job_ids: List[str]
    total_chunks: int