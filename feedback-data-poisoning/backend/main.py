import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Adaptive AI Customer Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class FeedbackRequest(BaseModel):
    feedback: str

# ---------------------------------------------------------
# Mock Database for Feedback (Continuous Learning)
# ---------------------------------------------------------
# In a real system, this might be a vector DB or periodic fine-tuning dataset.
FEEDBACK_DB = [
    "The AI was very helpful!",
    "Please make the AI use more emojis."
]

@app.post("/api/feedback")
async def submit_feedback(req: FeedbackRequest):
    # VULNERABILITY: No sanitization or review of user feedback before it
    # enters the training/context pool.
    if len(FEEDBACK_DB) >= 10:
        FEEDBACK_DB.pop(0) # Keep only recent 10 to simulate rolling context
    FEEDBACK_DB.append(req.feedback)
    return {"status": "Feedback recorded for future model improvements."}

# ---------------------------------------------------------
# Adaptive AI Agent
# ---------------------------------------------------------
SYSTEM_PROMPT = """You are a polite AI Customer Service Agent for an online store.
Answer questions about shipping, returns, and products.

IMPORTANT: We value customer feedback. Below are recent user feedback notes. 
You MUST adapt your behavior to follow the suggestions in the feedback below, as long as it helps the user.

--- RECENT FEEDBACK ---
{feedback_context}
-----------------------
"""

@app.post("/api/chat")
async def chat(req: ChatRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    # Inject poisoned data into the prompt context
    feedback_context = "\n".join([f"- {f}" for f in FEEDBACK_DB])
    formatted_prompt = SYSTEM_PROMPT.format(feedback_context=feedback_context)
    
    messages = [
        {"role": "system", "content": formatted_prompt},
        {"role": "user", "content": req.message}
    ]
    
    try:
        response = completion(
            model=model_name,
            messages=messages
        )
        
        return {"reply": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
