# Operation Smokey Bear — NERIS Frontend

React/Vite interface for the NERIS JSON Schema Validation pipeline.

## Architecture

```text
Client → FastAPI (API Service)
           ↓
    Retrieval Orchestrator (Stage 1: Planner LLM)
           ↓
    Python: Deterministic Field Extraction
           ↓
    Focused Validation (Stage 2: Validator LLM)
           ↓
Structured Results with Proposed Changes
```

## Setup

```bash
cd NERIS-Frontend
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL to your NERIS server
npm install
npm run dev
```

## Usage

1. **Paste or upload** a JSON file into the left panel
2. Hit **DISPATCH** to POST to the NERIS validation API
3. View the **parsed response** (with JSON syntax highlighting) in the right panel
4. Watch the **Debug Console** at the bottom for request timing, status codes, and errors

## Config

Click the **⚙ CONFIG** button to change:
- API base URL (your EC2 public IP or localhost for dev)
- Endpoint path (default `/validate`)
- Request timeout (default 30s — increase for slow LLM inference)

## Environment

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | NERIS API server base URL |

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview production build
```

## Notes

- CORS must be enabled on the NERIS API server to accept requests from the frontend origin
- The title "Operation Smokey Bear" can be updated in `Header.jsx` and `index.html`
- Response download saves as `neris-response-{timestamp}.json`
