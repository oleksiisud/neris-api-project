import json
from typing import List, Dict, Any, Optional
from .models import PlannerOutput, ValidationResponse, ValidationContext
from .planner_prompt_builder import PlannerPromptBuilder
from .planner_validator import PlannerValidator
from .field_extractor import extract_fields
from .validation_context_builder import ValidationContextBuilder
from .validation_prompt_builder import ValidationPromptBuilder

class RetrievalPlannerOrchestrator:
    """
    Orchestrates the two-stage LLM-driven semantic validation pipeline.
    
    Stage 1: LLM Planner (identify fields)
    Stage 2: Deterministic Extraction (backend)
    Stage 3: LLM Validator (check consistency)
    """

    def __init__(self, document: Dict[str, Any]):
        self.doc = document
        self.planner_builder = PlannerPromptBuilder()
        self.planner_validator = PlannerValidator()
        self.context_builder = ValidationContextBuilder()
        self.validator_builder = ValidationPromptBuilder()

    def _extract_narratives(self) -> List[str]:
        base = self.doc.get("base", {})
        return [
            base.get("outcome_narrative", ""),
            base.get("impediment_narrative", "")
        ]

    def _extract_comments(self) -> List[str]:
        dispatch = self.doc.get("dispatch", {})
        comments = []
        for c in dispatch.get("comments", []):
            if isinstance(c, dict) and c.get("comment"):
                comments.append(c.get("comment"))
        return comments

    def get_planner_prompt(self) -> str:
        """Returns the prompt for Stage 1 (Retrieval Planner)."""
        narratives = self._extract_narratives()
        comments = self._extract_comments()
        return self.planner_builder.build(narratives, comments)

    def process_planner_output(self, llm_output_json: str) -> str:
        """
        Takes the output from Stage 1, extracts fields, and builds the Stage 2 prompt.
        """
        try:
            data = json.loads(llm_output_json)
            planner_output = PlannerOutput(**data)
        except Exception as e:
            # Fallback or error handling
            return f"Error parsing planner output: {str(e)}"

        # 1. Validate requested fields
        validated_paths = self.planner_validator.validate(planner_output.fields_needed)
        
        # 2. Extract fields deterministically
        extracted_data = extract_fields(self.doc, validated_paths)
        
        # 3. Build validation context
        context = self.context_builder.build(
            narratives=self._extract_narratives(),
            comments=self._extract_comments(),
            relevant_fields=extracted_data,
            reasoning_focus=planner_output.reasoning_focus
        )
        
        # 4. Build validation prompt for Stage 2
        return self.validator_builder.build(context)

    def parse_validation_output(self, llm_output_json: str) -> ValidationResponse:
        """Parses the final validation output into structured models."""
        data = json.loads(llm_output_json)
        return ValidationResponse(**data)
