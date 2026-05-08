# LLM Service

The LLM service hosts:
- llama.cpp
- quantized GGUF models
- grammar-constrained decoding

The service should remain inference-only.

Do NOT place:
- queue logic
- retries
- orchestration
inside the inference runtime.


## Directory Structure

```text
llm/
├── Dockerfile
├── start.sh
├── grammars/
│   └── schema.gbnf
├── models/
│   └── llama-3.2-3b-instruct.Q4_K_M.gguf
└── llama.cpp/
```

## Model

Recommended starting model:

```text
Llama 3.2 3B Instruct
```

Recommended quantization:

```text
Q4_K_M
```

This balances:
- memory usage
- latency
- inference quality

## llama.cpp Startup

Example:

```bash
./server \
  -m ./models/llama-3.2-3b-instruct.Q4_K_M.gguf \
  -c 4096 \
  -t 4 \
  --host 0.0.0.0 \
  --port 8080 \
  --grammar-file ./grammars/schema.gbnf
```

## Grammar-Constrained Decoding

Grammar decoding ensures:
- valid JSON structure
- predictable outputs
- fewer malformed generations

The grammar file is located at:

```text
grammars/schema.gbnf
```

## Internal Networking

The LLM service should only be accessible internally.

Recommended Kubernetes service:

```yaml
spec:
  type: ClusterIP
```

## Health Checks

Recommended probes:
- readinessProbe
- startupProbe

Model loading may take significant time.

# Resource Recommendations

| Resource | Value |
| -------- | ----- |
| CPU      | 4     |
| Memory   | 8Gi   |
| Replicas | 1     |

# Running Locally

Build image:

```bash
docker build -t narrative-llm .
```