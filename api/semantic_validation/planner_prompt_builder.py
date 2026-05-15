from typing import List, Dict, Any
from .field_registry import get_available_fields_summary

class PlannerPromptBuilder:
    """Constructs the prompt for the Retrieval Planner LLM."""

    def __init__(self):
        self.system_instruction = (
            "You are a Retrieval Planner for a fire incident validation system. "
            "Your goal is to identify which structured JSON fields are needed to validate "
            "the semantic consistency of the provided narratives and comments. "
            "Return ONLY a JSON object with 'fields_needed' (list of paths) and 'reasoning_focus' (list of strings)."
        )

    def build(self, narratives: List[str], comments: List[str]) -> str:
        fields_summary = get_available_fields_summary()
        
        prompt = f"""
{self.system_instruction}

AVAILABLE FIELDS:
{fields_summary}

NARRATIVES:
{chr(10).join(narratives) if narratives else "No narrative provided."}

REVIEWER/DISPATCH COMMENTS:
{chr(10).join(comments) if comments else "No comments provided."}

TASK:
1. Identify potential contradictions between narratives and structured data.
2. Select ONLY the fields from the list above that are necessary to verify these contradictions.
3. Define the specific semantic focus for investigation.

OUTPUT FORMAT (JSON ONLY):
{{
  "fields_needed": ["path.to.field1", "path.to.field2"],
  "reasoning_focus": ["description of what to check"]
}}
"""
        return prompt.strip()

# Example planner output:
# {
#   "fields_needed": ["fire_detail.fire_spread", "base.outcome_narrative"],
#   "reasoning_focus": ["fire spread inconsistency"]
# }
