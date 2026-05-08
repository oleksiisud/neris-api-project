#!/bin/bash

#placeholder for the actual model path
./server \
  -m ./models/model.gguf \
  -c 4096 \
  -t 4 \
  --host 0.0.0.0 \
  --port 8080 \
  --grammar-file ./grammars/schema.gbnf