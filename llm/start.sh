#!/bin/bash

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
  --port 8080