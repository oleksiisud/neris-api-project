from fastapi import APIRouter, Query
import asyncio
import logging
from uuid import uuid4
from schemas import ValidationRequest, QueueResponse
from chunker import build_validation_contexts
from prompt_builder import build_prompt
from llm_client import call_llm
from validator import validate_response
from queue_client import validation_queue
from config import JOB_TIMEOUT

router = APIRouter()

MAX_RETRIES = 2

def build_fix_prompt(bad_output: str) -> str:
    return f"""
Your JSON output failed validation.
Fix ONLY the JSON formatting.
Return valid JSON only.
Bad Output:
{bad_output}
"""

async def process_context(prompt: str) -> list:
    retries = 0
    current_prompt = prompt
    raw_output = ""
    while retries <= MAX_RETRIES:
        try:
            raw_output = await call_llm(current_prompt)
            validated = validate_response(raw_output)
            return [issue.model_dump() for issue in validated.issues]
        except Exception as e:
            logging.exception("process_context attempt %d failed: %s", retries + 1, e)
            retries += 1
            if retries > MAX_RETRIES:
                return []
            if raw_output.strip():
                current_prompt = build_fix_prompt(raw_output)
            else:
                current_prompt = prompt
    return []

@router.post("/validate")
async def validate(request: ValidationRequest, mode: str = Query("sync", description="Set to 'async' to use the background queue")):
    validation_units = build_validation_contexts(request.model_dump())

    if mode == "async":
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

        return {
            "job_ids": job_ids,
            "total_chunks": len(validation_units),
            "status": "queued"
        }
    else:
        tasks = []
        for unit in validation_units:
            prompt = build_prompt(unit)
            tasks.append(process_context(prompt))

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        results = []
        for response in responses:
            if isinstance(response, list):
                results.extend(response)

        return {
            "changes": results
        }