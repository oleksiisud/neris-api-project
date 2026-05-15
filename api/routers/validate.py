from fastapi import APIRouter, HTTPException
import json
import logging
from schemas import ValidationRequest
from semantic_validation.retrieval_orchestrator import RetrievalPlannerOrchestrator
from llm_client import call_llm

router = APIRouter()

@router.post("/validate")
async def validate(request: ValidationRequest):
    document = request.model_dump()
    orchestrator = RetrievalPlannerOrchestrator(document)
    
    try:
        # STAGE 1: Retrieval Planning
        planner_prompt = orchestrator.get_planner_prompt()
        logging.info("Starting Stage 1: Retrieval Planning")
        planner_raw = await call_llm(planner_prompt, grammar_name="planner_output")
        
        # STAGE 2: Focused Validation
        validation_prompt = orchestrator.process_planner_output(planner_raw)
        
        if validation_prompt.startswith("Error"):
            logging.error(f"Planner output error: {validation_prompt}")
            return {"changes": [], "error": validation_prompt}

        logging.info("Starting Stage 2: Focused Validation")
        validation_raw = await call_llm(validation_prompt, grammar_name="validation_output")
        
        # Parse final structured output
        results = orchestrator.parse_validation_output(validation_raw)
        
        return results.model_dump()

    except Exception as e:
        logging.exception("Validation pipeline failed")
        raise HTTPException(status_code=500, detail=str(e))
