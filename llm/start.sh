#!/bin/bash

./llama.cpp/build/bin/llama-server \
  -m ./models/llama-neris.Q4_K_M.gguf \
  -c 4096 \
  -t 4 \
  --host 0.0.0.0 \
  --port 8080 \
  --grammar-file ./grammars/schema.gbnf