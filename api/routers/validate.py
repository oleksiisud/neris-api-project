from fastapi import APIRouter
from uuid import uuid4
from schemas import ValidationRequest, QueueResponse
from chunker import build_validation_contexts
from prompt_builder import build_prompt
from queue_client import validation_queue
from config import JOB_TIMEOUT

router = APIRouter()

@router.post("/validate", response_model=QueueResponse)
async def validate(request: ValidationRequest):
    validation_units = build_validation_contexts(request.model_dump())

    job_ids = []

    for unit in validation_units:
        prompt = build_prompt(unit)

        request_id = str(uuid4())

        job = validation_queue.enqueue(
            "worker.sync_process_validation_job",
            job_timeout=JOB_TIMEOUT,
            job_data = {
                "prompt": prompt,
                "request_id": request_id,
                "context_type": unit.context_type
            }
        )

        job_ids.append(job.id)

    return QueueResponse(
        job_ids=job_ids,
        total_chunks=len(validation_units)
    )