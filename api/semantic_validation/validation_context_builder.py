from typing import List, Dict, Any
from .models import ValidationContext

class ValidationContextBuilder:
    """Assembles the focused validation context for the second LLM pass."""

    def build(
        self,
        narratives: List[str],
        comments: List[str],
        relevant_fields: Dict[str, Any],
        reasoning_focus: List[str]
    ) -> ValidationContext:
        """
        Creates a structured context object.
        """
        # Determine context type based on the first focus item or a generic name
        context_type = "generic_semantic_validation"
        if reasoning_focus:
            # Clean up the focus string for a slug
            focus_slug = reasoning_focus[0].lower().replace(" ", "_")[:30]
            context_type = f"{focus_slug}_validation"

        return ValidationContext(
            context_type=context_type,
            narratives=narratives,
            comments=comments,
            relevant_fields=relevant_fields,
            reasoning_focus=reasoning_focus
        )
