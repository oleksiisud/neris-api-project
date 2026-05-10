import json
from typing import List
from schemas import ValidationContext

SYSTEM_PROMPT = """You are a NERIS incident report auditor. Given an incident \
JSON payload, identify any fields that are missing, contradictory, or \
inconsistent with the narrative descriptions (outcome_narrative, \
impediment_narrative, dispatch.disposition, dispatch.comments). \
Be specific about the field path, the current value, and what it should \
reflect based on the narrative. Return your response as a JSON object \
with exactly two keys: status ("VALID" or "INVALID") and issues (a list \
of objects, empty if status is VALID). Each issue object must have: \
field_path, current_value, narrative_source, narrative_excerpt, \
severity ("HIGH", "MEDIUM", or "LOW"), suggested_correction. \
Output only the JSON object. Do not include any explanation, commentary, \
or text outside the JSON object."""

def build_prompt(context: ValidationContext) -> str:
    """
    Constructs a prompt based on a specific semantic validation unit.
    """
    # Consolidate context data for the LLM
    input_data = {
        "context_type": context.context_type,
        "primary_entity": context.primary_object,
        "related_entities": context.related_objects,
        "user_comments": context.comments
    }

    # Inject dynamic schema rules derived from the NERIS specification
    rules_section = ""
    if context.relevant_schema_rules:
        rules_section = "### RELEVANT SCHEMA RULES:\n- " + "\n- ".join(context.relevant_schema_rules)

    return f"""
{SYSTEM_PROMPT}

{rules_section}

### INPUT DATA (VALIDATION UNIT):
{json.dumps(input_data, indent=2)}

### INSTRUCTIONS:
Analyze the input above. Identify any fields in the primary or related objects that contradict the user comments or narratives.
Provide proposed fixes in the 'proposed_value' field with the corrected value, and set 'original_value' to the field's current value.
"""