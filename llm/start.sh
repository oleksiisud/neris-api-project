#!/bin/bash

./llama.cpp/build/bin/llama-server \
  -m ./models/model.gguf \
  -c 4096 \
  -t 4 \
  --host 0.0.0.0 \
  --port 8080