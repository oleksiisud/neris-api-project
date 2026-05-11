import json
from fastapi import FastAPI, Request

app = FastAPI()

MOCK_RESPONSE = json.dumps({
    "status": "INVALID",
    "issues": [
        {
            "field_path": "base.outcome_narrative",
            "current_value": "structure fire",
            "narrative_source": "outcome_narrative",
            "narrative_excerpt": "Unit arrived and found a working fire",
            "severity": "LOW",
            "suggested_correction": "Mock LLM — replace with a real model for actual analysis"
        }
    ]
})


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/completion")
async def completion(request: Request):
    return {"content": MOCK_RESPONSE}
