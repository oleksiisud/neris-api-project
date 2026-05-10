import os

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Must be > (MAX_RETRIES + 1) * REQUEST_TIMEOUT to avoid JobTimeoutException.
# Default: 3 attempts × 120s + 60s buffer = 420s → rounded up to 600s.
JOB_TIMEOUT = int(os.getenv("JOB_TIMEOUT", 600))

LLM_URL = os.getenv("LLM_URL", "http://llm:8080/completion")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 60))