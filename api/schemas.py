from pydantic import BaseModel
from typing import List, Dict, Any


class ValidationRow(BaseModel):
    row_id: int
    data: Dict[str, Any]
    comments: str


class ValidationRequest(BaseModel):
    rows: List[ValidationRow]


class QueueResponse(BaseModel):
    job_ids: List[str]
    total_chunks: int