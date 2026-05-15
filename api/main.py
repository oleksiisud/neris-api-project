from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import validate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://neris-api-proj.vercel.app"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Accept", "Content-Type"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(validate.router)