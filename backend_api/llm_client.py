import httpx
import os

LLM_URL = os.getenv("LLM_URL", "http://localhost:8001/analyze")


async def send_to_llm(data: dict):
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(LLM_URL, json=data)
            return response.json()

    except Exception as e:
        return {
            "error": "LLM request failed",
            "details": str(e)
        }
    