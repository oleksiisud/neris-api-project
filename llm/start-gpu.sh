#!/bin/bash

# GPU-accelerated version of llama-server
# Requires: llama.cpp built with GPU support (CUDA for NVIDIA, etc.)
# Recommended for: g4dn instances (NVIDIA T4 GPUs) and similar

./llama.cpp/build/bin/llama-server \
  -m ./models/llama-neris.Q4_K_M.gguf \
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
