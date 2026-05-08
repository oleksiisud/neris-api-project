from fastapi import APIRouter
from uuid import uuid4
from schemas import ValidationRequest, QueueResponse
from chunker import chunk_rows
from prompt_builder import build_prompt
from queue_client import validation_queue

router = APIRouter()

@router.post("/validate", response_model=QueueResponse)
async def validate(request: ValidationRequest):

    chunks = chunk_rows(request.rows)

    job_ids = []

    for chunk in chunks:

        prompt = build_prompt(chunk)

        request_id = str(uuid4())

        job = validation_queue.enqueue(
            "worker.sync_process_validation_job",
            {
                "prompt": prompt,
                "request_id": request_id
            }
        )

        job_ids.append(job.id)

    return QueueResponse(
        job_ids=job_ids,
        total_chunks=len(chunks)
    )