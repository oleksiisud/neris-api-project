import os

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

LLM_URL = os.getenv("LLM_URL","")

MAX_RETRIES = int(os.getenv("MAX_RETRIES", 2))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 120))