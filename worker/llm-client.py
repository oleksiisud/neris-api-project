import httpx
import orjson

from config import LLM_URL, REQUEST_TIMEOUT


async def call_llm(prompt: str) -> str:
    payload = {
        "prompt": prompt,
        "temperature": 0.1,
        "top_p": 0.9,
        "max_tokens": 512,
        "stop": ["</s>"]
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(
            LLM_URL,
            json=payload
        )

        response.raise_for_status()

        data = response.json()

        return data["content"]