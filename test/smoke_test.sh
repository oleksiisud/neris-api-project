#!/bin/bash
# Smoke-tests the running stack. Run after docker compose is up.
# Usage: bash test/smoke_test.sh

set -e
API="http://localhost:8000"
PAYLOAD="$(dirname "$0")/sample_payload.json"

echo "=== Health check ==="
curl -sf "$API/health" | python3 -m json.tool

echo ""
echo "=== Sync validation ==="
curl -sf -X POST "$API/validate?mode=sync" \
  -H "Content-Type: application/json" \
  -d @"$PAYLOAD" | python3 -m json.tool

echo ""
echo "=== Async validation (queue) ==="
JOBS=$(curl -sf -X POST "$API/validate?mode=async" \
  -H "Content-Type: application/json" \
  -d @"$PAYLOAD")
echo "$JOBS" | python3 -m json.tool

echo ""
echo "All smoke tests passed."
