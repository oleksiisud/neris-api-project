import asyncio
import json
import logging

from rq import Worker, Queue, Connection
from redis import Redis

from config import REDIS_HOST, REDIS_PORT, MAX_RETRIES
from llm_client import call_llm
from validator import validate_response

logging.basicConfig(level=logging.INFO)

redis_conn = Redis(
    host=REDIS_HOST,
    port=REDIS_PORT
)


def build_fix_prompt(bad_output: str) -> str:
    return f"""
Your JSON output failed validation.
Fix ONLY the JSON formatting.
Return valid JSON only.
Bad Output:
{bad_output}
"""


async def process_validation_job(job_data: dict):
    """
    Expected job payload:
    {
        "prompt": "...",
        "request_id": "abc123"
    }
    """

    original_prompt = job_data["prompt"]
    prompt = original_prompt

    retries = 0
    raw_output = ""
    while retries <= MAX_RETRIES:

        try:
            logging.info(f"Calling LLM (attempt {retries + 1})")
            raw_output = await call_llm(prompt)
            validated = validate_response(raw_output)
            logging.info("Validation successful")

            return validated.model_dump()

        except Exception as e:
            logging.exception("Validation failed")
            retries += 1
            if retries > MAX_RETRIES:
                raise

            if raw_output.strip():
                prompt = build_fix_prompt(raw_output)
            else:
                logging.warning("Empty LLM response — retrying with original prompt")
                prompt = original_prompt


def sync_process_validation_job(job_data: dict):
    return asyncio.run(process_validation_job(job_data))


if __name__ == "__main__":

    with Connection(redis_conn):

        worker = Worker(
            queues=["validation"]
        )

        logging.info("Worker started")

        worker.work()