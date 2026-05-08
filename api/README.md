# API Service

The API service is responsible for:
- receiving validation requests
- chunking rows
- building prompts
- queueing jobs into Redis
- returning job IDs

The API layer should remain stateless.

## Directory Structure

```text
api/
├── main.py
├── queue_client.py
├── prompt_builder.py
├── chunker.py
├── schemas.py
├── config.py
├── requirements.txt
└── Dockerfile
```

## Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

### Validation Endpoint

```http
POST /validate
```

Example request:

```json
{
  "rows": [
    {
      "row_id": 1,
      "data": {
        "status": "inactive"
      },
      "comments": "User should still be active"
    }
  ]
}
```

Example response:

```json
{
  "job_ids": [
    "123abc"
  ],
  "total_chunks": 1
}
```

---

## Prompting Strategy

The API constructs prompts using:
- compact system instructions
- examples
- chunked row data

## Chunking

Rows are chunked to:
- reduce prompt size
- improve inference speed
- avoid context overflow

Default chunk size:

```python
MAX_ROWS_PER_CHUNK = 10
```

---

## Running Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Run server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Environment Variables

| Variable   | Purpose        |
| ---------- | -------------- |
| REDIS_HOST | Redis hostname |
| REDIS_PORT | Redis port     |

---

## Docker Build

```bash
docker build -t narrative-api .
```