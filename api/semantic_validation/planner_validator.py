from typing import List, Set, Any
from .field_registry import FIELD_REGISTRY, resolve_alias

class PlannerValidator:
    """Validates and sanitizes the output from the Retrieval Planner LLM."""

    def __init__(
        self, 
        max_fields: int = 15, 
        max_depth: int = 5,
        max_estimated_tokens: int = 2000
    ):
        self.max_fields = max_fields
        self.max_depth = max_depth
        self.max_estimated_tokens = max_estimated_tokens
        self.valid_paths = {info["path"] for info in FIELD_REGISTRY.values()}

    def validate(self, fields_needed: List[str]) -> List[str]:
        """
        Validates, deduplicates, and filters requested field paths.
        """
        validated_paths: Set[str] = set()
        
        for raw_path in fields_needed:
            # 1. Resolve alias if necessary
            path = resolve_alias(raw_path) or raw_path
            
            # 2. Check if path is in registry
            if path in self.valid_paths:
                # 3. Check depth
                if path.count('.') < self.max_depth:
                    validated_paths.add(path)
            
            if len(validated_paths) >= self.max_fields:
                break
                
        return list(validated_paths)

    def estimate_tokens(self, context: Any) -> int:
        return len(str(context)) // 4
