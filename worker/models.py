from pydantic import BaseModel
from typing import List, Dict, Any

class ConfidenceScores(BaseModel):
    incorrectness_confidence: int
    fix_confidence: int
    narrative_clarity: int

class Change(BaseModel):
    field: str
    comment: str
    # Using Dict[str, Any] to allow dynamic keys like {"username": "new_value"}
    proposed_field: Dict[str, Any]
    confidence_scores: ConfidenceScores

class ValidationResponse(BaseModel):
    changes: List[Change]