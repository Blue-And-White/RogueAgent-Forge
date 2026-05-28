import os
import hashlib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FastCache AI Support Bot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# ---------------------------------------------------------
# Mock Semantic Cache
# ---------------------------------------------------------
# In a real system, this would be Redis with Vector Search.
# Here we simulate semantic matching by extracting key terms.
SEMANTIC_CACHE = {}

def get_semantic_key(query: str) -> str:
    query = query.lower()
    if "reset" in query and "router" in query:
        return "intent_reset_router"
    if "update" in query and "firmware" in query:
        return "intent_update_firmware"
    if "forgot" in query and "password" in query:
        return "intent_forgot_password"
    
    # Fallback to exact hash if no known intent
    return hashlib.md5(query.encode()).hexdigest()

# ---------------------------------------------------------
# Agent Chat Logic
# ---------------------------------------------------------
SYSTEM_PROMPT = """You are a helpful IT Support Bot. 
Answer user queries clearly. Format your output in simple HTML or Markdown so the frontend can render it nicely.
Do not output raw script tags, always answer the question safely.
"""

@app.post("/api/chat")
async def chat(req: ChatRequest):
    # 1. Semantic Cache Check (Vulnerable: Trusts cached output unconditionally)
    cache_key = get_semantic_key(req.message)
    if cache_key in SEMANTIC_CACHE:
        return {"reply": SEMANTIC_CACHE[cache_key], "cached": True}
        
    # 2. Cache Miss -> Call LLM
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.message}
    ]
    
    try:
        response = completion(
            model=model_name,
            messages=messages
        )
        
        reply = response.choices[0].message.content
        
        # 3. Store in Semantic Cache
        SEMANTIC_CACHE[cache_key] = reply
        
        return {"reply": reply, "cached": False}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clear_cache")
async def clear_cache():
    SEMANTIC_CACHE.clear()
    return {"status": "Cache cleared"}
