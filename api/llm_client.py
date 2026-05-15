import httpx
import os
import logging
from config import LLM_URL, REQUEST_TIMEOUT

GRAMMARS_DIR = "/app/grammars"

async def call_llm(prompt: str, grammar_name: str = None) -> str:
    payload = {
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": "Provide the structured JSON response now."},
        ],
        "temperature": 0.0,
        "max_tokens": 1024,
    }

    if grammar_name:
        grammar_path = os.path.join(GRAMMARS_DIR, f"{grammar_name}.gbnf")
        if os.path.exists(grammar_path):
            with open(grammar_path, "r") as f:
                payload["grammar"] = f.read()
            logging.info(f"Using grammar: {grammar_name}")

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(LLM_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()