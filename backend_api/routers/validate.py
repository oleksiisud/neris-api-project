from fastapi import APIRouter
from llm_client import send_to_llm
router = APIRouter()

@router.post("/validate")
async def validate(data: dict):
    result = await send_to_llm(data)
    return result

