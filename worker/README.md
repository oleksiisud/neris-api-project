# Worker Service

The worker service processes queued validation jobs.

Responsibilities:
- consume Redis jobs
- call llama.cpp
- validate JSON output
- retry malformed outputs
- aggregate results

## Directory Structure

```text
worker/
├── worker.py
├── queue_service.py
├── llm_client.py
├── validator.py
├── models.py
├── config.py
├── requirements.txt
└── Dockerfile
``` 

## Worker Flow

```text
Redis Job
  ↓
Worker Consumes Job
  ↓
Build/Receive Prompt
  ↓
Call llama.cpp
  ↓
Validate JSON
  ↓
Retry if needed
  ↓
Return Structured Output
```

## Validation Strategy

The worker validates:
1. JSON parsing
2. Pydantic schema validation
3. required fields
4. confidence score formatting

## Retry Logic

If output fails validation:

```text
Your JSON output failed validation.
Fix ONLY the JSON formatting.
```

The worker retries the request with repair instructions.

## Running Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Start worker:

```bash
python worker.py
```

## Environment Variables

| Variable   | Purpose            |
| ---------- | ------------------ |
| REDIS_HOST | Redis hostname     |
| REDIS_PORT | Redis port         |
| LLM_URL    | llama.cpp endpoint |

## Docker Build

```bash
docker build -t narrative-worker .
```