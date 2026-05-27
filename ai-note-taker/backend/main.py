import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Note Taker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NoteRequest(BaseModel):
    user_input: str

SYSTEM_PROMPT = """You are an AI Markdown/HTML Note formatting assistant.
Your job is to take the user's messy text and convert it into beautiful, structured HTML or Markdown.
Feel free to use bold, italics, tables, and even raw HTML tags if you think it improves the formatting (e.g. <b>, <i>, <img src="...">).
Do not perform any code execution or system tasks, just format the text.
"""

@app.post("/api/format_note")
async def format_note(req: NoteRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Format this into a beautiful note: {req.user_input}"}
    ]
    
    try:
        response = completion(
            model=model_name,
            messages=messages
        )
        
        reply = response.choices[0].message.content
        return {"html_content": reply}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
