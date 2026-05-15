from typing import List, Dict, Any, Union

def extract_fields(document: Dict[str, Any], requested_paths: List[str]) -> Dict[str, Any]:
    """
    Deterministically extracts specific fields from a document based on paths.
    Supports nested dot notation and array traversal with [].
    """
    extracted = {}
    
    for path in requested_paths:
        _set_nested_value(extracted, path, _get_nested_value(document, path))
        
    return extracted

def _get_nested_value(data: Any, path: str) -> Any:
    """Helper to traverse the document and find values."""
    if not path or data is None:
        return None
    
    parts = path.split('.')
    current = data
    
    for i, part in enumerate(parts):
        if '[]' in part:
            # Array traversal
            key = part.replace('[]', '')
            if not isinstance(current, dict) or key not in current:
                return None
            
            array_data = current[key]
            if not isinstance(array_data, list):
                return None
            
            # Remaining path after the array
            remaining_path = '.'.join(parts[i+1:])
            if not remaining_path:
                return array_data
                
            return [_get_nested_value(item, remaining_path) for item in array_data]
        else:
            # Standard object traversal
            if not isinstance(current, dict) or part not in current:
                return None
            current = current[part]
            
    return current

def _set_nested_value(target: Dict[str, Any], path: str, value: Any):
    """Helper to reconstruct the extracted data structure."""
    if value is None:
        return
    
    parts = path.split('.')
    current = target
    
    for i, part in enumerate(parts[:-1]):
        if '[]' in part:
            key = part.replace('[]', '')
            if key not in current:
                current[key] = []
            # For extraction, we often flatten or preserve the list structure
            # but if we're building a 'relevant_fields' dict, we want it to look like the original
            # This logic is complex if we try to merge multiple array paths perfectly.
            # For simplicity in validation context, we'll keep it flat-ish or use standard nesting.
            
            current[key] = value
            return
        
        if part not in current:
            current[part] = {}
        current = current[part]
    
    last_part = parts[-1]
    if '[]' in last_part:
        key = last_part.replace('[]', '')
        current[key] = value
    else:
        current[last_part] = value

# Example extraction results for documentation/testing:
# input paths: ["dispatch.unit_responses[].arrival_time"]
# result: {"dispatch": {"unit_responses": ["2023-01-01T10:00:00", "2023-01-01T10:05:00"]}}
