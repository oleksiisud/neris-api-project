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
└── models/
    └── model.gguf   ← you must place your GGUF file here before running
```

## Model

Recommended starting model: **Llama 3.2 3B Instruct Q4_K_M**

This balances memory usage, latency, and inference quality at ~2GB on disk.

### Downloading the model

Download from Hugging Face using `huggingface-cli` (requires `pip install huggingface_hub`):

```bash
huggingface-cli download \
  bartowski/Llama-3.2-3B-Instruct-GGUF \
  Llama-3.2-3B-Instruct-Q4_K_M.gguf \
  --local-dir ./llm/models \
  --local-dir-use-symlinks False

# Rename to the expected filename
mv llm/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf llm/models/model.gguf
```

Or download manually from:
```
https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF
```
and place the file at `llm/models/model.gguf`.

## llama.cpp Startup

The `start.sh` script runs:

```bash
./llama.cpp/build/bin/llama-server \
  -m ./models/model.gguf \
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