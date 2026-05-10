# Narrative Validation System

A private, containerized LLM validation system designed for deployment on AWS EKS.

The system validates structured JSON rows against natural-language comments and returns structured change recommendations.

## Architecture

The system supports a Hybrid Architecture, allowing for both synchronous and asynchronous inference paths:

### Mode 1 — Synchronous (Default)
Best for local development, fast responses, and focused validation units.
```text
Client
  ↓
FastAPI API Service
  ↓
Context Builder
  ↓
llama.cpp Inference Service
  ↓
Llama 3.2 GGUF Model
```

### Mode 2 — Async (`?mode=async`)
Best for large batch processing or long-running validation.
```text
Client
  ↓
FastAPI API Service
  ↓
Redis Queue
  ↓
Worker Service
  ↓
llama.cpp Inference Service
  ↓
Llama 3.2 GGUF Model
```

## Components

| Directory | Purpose                       |
| --------- | ----------------------------- |
| /api      | FastAPI request handling      |
| /worker   | Queue workers + orchestration |
| /llm      | llama.cpp inference runtime   |
| /k8s      | Kubernetes manifests          |

## Requirements

- Docker
- Kubernetes / EKS
- Redis
- AWS CLI
- kubectl
- eksctl

## Local Development

Run:

```bash
docker-compose up --build
```

API available at:

```text
http://localhost:8000
```

llama.cpp available at:

```text
http://localhost:8080
```

## Deployment Flow

1. Build Docker images
2. Push images to ECR
3. Deploy manifests to EKS
4. Configure ingress
5. Verify pod health