import json
from typing import Any, Dict, List


def unescape_values(obj: Any) -> Any:
    """
    Recursively unescapes double-encoded JSON strings in validation responses.
    
    Example:
        Input:  {"original_value": "[{\"type\":\"LAWENFORCE\"}]"}
        Output: {"original_value": [{"type": "LAWENFORCE"}]}
    """
    if isinstance(obj, str):
        # Try to parse if it looks like escaped JSON
        if obj.startswith(('[', '{')):
            try:
                return json.loads(obj)
            except (json.JSONDecodeError, ValueError):
                return obj
        return obj
    
    elif isinstance(obj, dict):
        return {key: unescape_values(value) for key, value in obj.items()}
    
    elif isinstance(obj, list):
        return [unescape_values(item) for item in obj]
    
    return obj


def fix_validation_response(response_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fixes common serialization issues in validation responses.
    
    - Unescapes double-encoded JSON in original_value and proposed_value
    """
    if "changes" in response_data:
        for change in response_data["changes"]:
            # Unescape original_value and proposed_value
            if "original_value" in change:
                change["original_value"] = unescape_values(change["original_value"])
            if "proposed_value" in change:
                change["proposed_value"] = unescape_values(change["proposed_value"])
    
    return response_data
