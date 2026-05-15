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
├── start.sh              (CPU-optimized)
├── start-gpu.sh          (GPU-accelerated)
├── grammars/
│   └── schema.gbnf
└── models/
    └── llama-neris.Q4_K_M.gguf   ← the optimized project model
    └── model.gguf                ← generic filename for custom models
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

### CPU-based (Default - start.sh)

```bash
./llama.cpp/build/bin/llama-server \
  -m ./models/model.gguf \
  -c 4096 \
  -t 8 \
  --cache-type-k q4_0 \
  --cache-type-v q4_0 \
  --cont-batching \
  -ub 512 \
  -b 512 \
  --host 0.0.0.0 \
  --port 8080
```

Use this for CPU-optimized instances (c7i, m7i, etc.). Inference speed: ~100-300ms per token depending on model size.

### GPU-accelerated (start-gpu.sh)

```bash
./llama.cpp/build/bin/llama-server \
  -m ./models/model.gguf \
  -c 4096 \
  -t 8 \
  --cache-type-k q4_0 \
  --cache-type-v q4_0 \
  --cont-batching \
  -ub 512 \
  -b 512 \
  --host 0.0.0.0 \
  --port 8080 \
  -ngl 35 \
  -ngpu 1
```

**Key GPU-specific flags:**
- `-ngl 35`: Offload 35 layers to GPU (adjust based on model and GPU memory)
- `-ngpu 1`: Use 1 GPU (for multi-GPU systems, increase as needed)

Use this for GPU-accelerated instances (g4dn with NVIDIA T4 GPUs). Inference speed: ~20-50ms per token (3-5x faster).

**Prerequisites for GPU:**
- llama.cpp compiled with CUDA support
- NVIDIA GPU drivers installed
- CUDA toolkit installed
- Sufficient GPU memory (~8GB+ for T4 with Q4 quantized models)

## Grammar-Constrained Decoding

Grammar decoding ensures:
- valid JSON structure
- predictable outputs
- fewer malformed generations

The grammar files are located at:

```text
grammars/
├── planner_output.gbnf      # Stage 1: Field identification
├── validation_output.gbnf   # Stage 2: Consistency checking
└── schema.gbnf              # Generic validation schema
```

## Docker Build Options

### CPU Build (Default)

Build the standard CPU-optimized image:

```bash
docker build -t neris-llm:latest -f llm/Dockerfile ./llm
```

Run with CPU startup script:
```bash
docker run -v ./models:/app/models neris-llm:latest ./start.sh
```

### GPU Build (NVIDIA CUDA)

Build the GPU-accelerated image with CUDA support:

```bash
docker build -t neris-llm:gpu -f llm/Dockerfile.gpu ./llm
```

Run with GPU startup script (ensure NVIDIA Docker runtime is available):
```bash
docker run --gpus all -v ./models:/app/models neris-llm:gpu ./start-gpu.sh
```

For docker-compose, add GPU support:
```yaml
services:
  llm:
    image: neris-llm:gpu
    build:
      context: ./llm
      dockerfile: Dockerfile.gpu
    volumes:
      - ./llm/models:/app/models:ro
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
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