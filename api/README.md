# API Service (NERIS Semantic Validation)

The API service provides a high-performance, two-stage semantic validation pipeline for NERIS JSON documents. It transitions from brittle static chunking to an LLM-driven retrieval planning system.

## Key Features
- **Two-Stage Validation**: 
    1. **Retrieval Planning**: LLM identifies which JSON fields are relevant to the provided narratives.
    2. **Focused Validation**: Backend extracts ONLY those fields, and a second LLM pass checks for semantic consistency.
- **Optimized for CPU**: Sequential execution and GBNF grammars ensure stability on constrained local hardware.
- **Deterministic Extraction**: Offloads data retrieval to Python logic to minimize LLM context overhead.
- **Strict Output Control**: Uses GBNF grammars to force structured JSON output and eliminate "hallucinated" conversational text.

## Directory Structure

```text
api/
├── main.py                     # Entry point
├── llm_client.py               # Optimized HTTP client for llama.cpp
├── routers/
│   ├── __init__.py
│   └── validate.py             # Validation endpoint and stage orchestration
├── semantic_validation/
│   ├── __init__.py
│   ├── retrieval_orchestrator.py # Orchestrates the 2-stage workflow
│   ├── field_registry.py        # Central registry of valid JSON paths
│   ├── field_extractor.py       # Deterministic nested field retrieval
│   ├── planner_prompt_builder.py # Stage 1 prompt logic
│   ├── validation_prompt_builder.py # Stage 2 prompt logic
│   ├── validation_context_builder.py # Context assembly for Stage 2
│   ├── response_fixer.py        # Post-processing for validation results
│   ├── models.py                # Pydantic models for planner/validator
│   └── planner_validator.py     # Safety layer for requested fields
├── grammars/
│   ├── planner_output.gbnf      # Stage 1 grammar
│   └── validation_output.gbnf   # Stage 2 grammar
├── schemas.py                   # Global API schemas
├── config.py                   # Environment configuration
└── requirements.txt
```

## Endpoints

### Validation Endpoint
`POST /validate`

Analyzes a NERIS document (including narratives and comments) and returns a list of proposed semantic corrections.

**Example Response**:
```json
{
  "changes": [
    {
      "field_path": "fire_detail.fire_spread",
      "original_value": "Confined to room",
      "comment": "Narrative describes the fire spreading to the roof, which contradicts 'Confined to room'.",
      "proposed_value": "Spread beyond structure",
      "confidence_scores": {
        "incorrectness_confidence": 0.95,
        "fix_confidence": 0.8,
        "narrative_clarity": 0.9
      }
    }
  ]
}
```

## Performance Optimizations
- **KV Cache Quantization**: Configured in `llm/start.sh` to reduce memory bandwidth by 4x.
- **GBNF Grammars**: Located in `llm/grammars/`, these ensure the LLM never generates redundant text, saving 50%+ on inference time.
- **Prefix Caching**: Designed to reuse instruction headers between planning and validation stages.

## Running Locally

1. Install dependencies: `pip install -r requirements.txt`
2. Start the LLM service (see `llm/README.md`).
3. Run the API: `uvicorn main:app --host 0.0.0.0 --port 8000`