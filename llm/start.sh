#!/bin/bash

./llama.cpp/build/bin/llama-server \
  -m ./models/llama-neris.Q4_K_M.gguf \
  -c 2048 \
  -t 8 \
  --host 0.0.0.0 \
  --port 8080 \
  --grammar-file ./grammars/schema.gbnf