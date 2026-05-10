from pydantic import BaseModel
from typing import List, Any, Literal, Optional


class Issue(BaseModel):
    field_path: str
    current_value: Any
    narrative_source: str
    narrative_excerpt: str
    severity: Literal["HIGH", "MEDIUM", "LOW"]
    suggested_correction: str


class ValidationResponse(BaseModel):
    status: Literal["VALID", "INVALID"]
    issues: List[Issue]