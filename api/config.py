import os

LLM_URL = os.getenv("LLM_URL", "http://llm:8080/completion")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 120))
