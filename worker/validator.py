import json
import re
import logging
from models import ValidationResponse


def extract_json(raw: str) -> dict:
    raw = raw.strip()

    if not raw:
        raise ValueError("LLM returned an empty response")

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(
        f"Could not extract valid JSON from LLM output "
        f"(length={len(raw)}, preview={raw[:120]!r})"
    )


def validate_response(raw_output: str) -> ValidationResponse:
    parsed = extract_json(raw_output)
    return ValidationResponse.model_validate(parsed)