import json
from models import ValidationResponse


def validate_response(raw_output: str) -> ValidationResponse:
    parsed = json.loads(raw_output)
    return ValidationResponse.model_validate(parsed)