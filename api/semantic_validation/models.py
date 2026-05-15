from pydantic import BaseModel
from typing import List, Any, Dict, Optional, Literal

class ValidationSignal(BaseModel):
    id: str
    reason: str
    paths: List[str]
    entities: List[str]
    confidence: float

class ValidationTarget(BaseModel):
    signal_id: str
    rule: str
    context: Dict[str, Any]
    field_paths: List[str]

class PlannerOutput(BaseModel):
    fields_needed: List[str]
    reasoning_focus: List[str]

class ConfidenceScores(BaseModel):
    incorrectness_confidence: float
    fix_confidence: float
    narrative_clarity: float

class ValidationChange(BaseModel):
    field_path: str
    original_value: Any
    comment: str
    proposed_value: Any
    confidence_scores: ConfidenceScores

class ValidationResponse(BaseModel):
    changes: List[ValidationChange]

class ValidationContext(BaseModel):
    context_type: str
    narratives: List[str]
    comments: List[str]
    relevant_fields: Dict[str, Any]
    reasoning_focus: List[str]
