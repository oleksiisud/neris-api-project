from fastapi import FastAPI
from routers import validate

app = FastAPI()

app.include_router(validate.router)

@app.get("/")
def home():
    return {"status": "running"}