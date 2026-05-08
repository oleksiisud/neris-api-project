import os

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

LLM_URL = os.getenv("LLM_URL","")

MAX_RETRIES = 2
REQUEST_TIMEOUT = 120