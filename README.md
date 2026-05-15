# NERIS Narrative Validation System

A private, containerized LLM-driven validation system designed for NERIS (National Emergency Response Information System) data. It specializes in detecting semantic contradictions between human-written narratives and structured incident data.

## Advanced Two-Stage Architecture

The system utilizes a **Retrieval-Oriented Validation Pipeline** to ensure high accuracy while maintaining small context windows and fast inference on CPU hardware.

### Stage 1: Retrieval Planning
The LLM analyzes incident narratives and reviewer comments to determine which specific JSON fields (out of hundreds) are semantically relevant for consistency checking.

### Stage 2: Focused Validation
The backend deterministically extracts the requested fields. A second LLM pass adjudicates the focused context to identify specific contradictions and propose corrections with confidence scores.

```text
Client
  ↓
FastAPI (API Service)
  ↓
Retrieval Orchestrator
  ↓
Stage 1: Planner LLM (GBNF Constrained)
  ↓
Python: Deterministic Field Extraction
  ↓
Stage 2: Validator LLM (GBNF Constrained)
  ↓
Structured Validation Results
```

## Performance & Optimization

- **llama.cpp Integration**: Runs Llama-based GGUF models locally on CPU with zero external API dependencies.
- **GBNF Grammars**: Enforces strict JSON schemas at the sampling level, eliminating parsing errors and redundant token generation.
- **KV Cache Quantization**: Uses 4-bit quantization for internal LLM memory to boost CPU throughput by ~30%.
- **Sequential Execution**: Optimized for 4-8 core environments by avoiding parallel resource contention.

## Components

| Directory | Purpose |
| --- | --- |
| `/api` | FastAPI service, stage orchestration, and deterministic extraction. |
| `/llm` | llama.cpp inference runtime with optimized GBNF grammars. |
| `/test_data` | Sample NERIS records for validation testing. |

## Quick Start (Local Docker)

1. Ensure you have the NERIS GGUF model in `llm/models/`.
2. Run the stack:
   ```bash
   docker compose up --build
   ```
3. The API is available at `http://localhost:8000/validate`.

## Requirements
- Docker & Docker Compose
- 8GB+ RAM (16GB recommended)
- 4+ CPU Cores