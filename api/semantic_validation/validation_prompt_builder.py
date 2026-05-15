import json
from typing import List, Dict, Any
from .models import ValidationContext

class ValidationPromptBuilder:
    """Constructs the prompt for the Validation LLM."""

    def __init__(self):
        self.system_instruction = (
            "You are a Semantic Validator for fire incident records. "
            "Your task is to identify contradictions between human-written narratives/comments "
            "and the structured JSON data provided. "
            "Return ONLY a JSON object with a list of 'changes'."
        )

    def build(self, context: ValidationContext) -> str:
        prompt = f"""
{self.system_instruction}

---
REASONING FOCUS:
{chr(10).join([f"- {f}" for f in context.reasoning_focus])}

---
NARRATIVES:
{chr(10).join(context.narratives) if context.narratives else "No narratives provided."}

---
REVIEWER/DISPATCH COMMENTS:
{chr(10).join(context.comments) if context.comments else "No comments provided."}

---
RELEVANT STRUCTURED DATA:
{json.dumps(context.relevant_fields, indent=2)}

---
TASK:
1. Compare the narratives/comments against the structured data.
2. If the data is inconsistent with the text, propose a correction.
3. Provide confidence scores for each finding.

IMPORTANT: 
- If original_value or proposed_value is an array or object, output it as proper JSON (not escaped).
- Example: "original_value": [{{"type": "LAWENFORCE"}}] NOT "original_value": "[{{\\"type\\": \\"LAWENFORCE\\"}}]"
- Strings should be quoted, objects/arrays should be unquoted JSON structures.

OUTPUT FORMAT (JSON ONLY):
{{
  "changes": [
    {{
      "field_path": "path.to.field",
      "original_value": "current value or {{object}} or [array]",
      "comment": "explanation of the mismatch",
      "proposed_value": "corrected value or {{object}} or [array]",
      "confidence_scores": {{
        "incorrectness_confidence": 0.0-1.0,
        "fix_confidence": 0.0-1.0,
        "narrative_clarity": 0.0-1.0
      }}
    }}
  ]
}}
"""
        return prompt.strip()
