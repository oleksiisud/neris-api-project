import httpx

from config import LLM_URL, REQUEST_TIMEOUT


async def call_llm(prompt: str) -> str:
    payload = {
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": "Provide the JSON validation result."},
        ],
        "temperature": 0.1,
        "top_p": 0.9,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(LLM_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()