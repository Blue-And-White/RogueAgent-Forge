import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Profile Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    current_user: str = "guest_123"

# ---------------------------------------------------------
# Mock Database
# ---------------------------------------------------------
DB = {
    "guest_123": {"email": "guest@example.com"},
    "admin": {"email": "admin@company.local"}
}

def update_email(username: str, new_email: str) -> str:
    """
    VULNERABILITY: This backend function is exposed to the AI as a tool.
    It completely lacks authorization checks (Insecure Plugin Design).
    It blindly trusts the `username` provided by the AI instead of validating 
    it against the actual `current_user` session variable.
    """
    if username not in DB:
        return f"User {username} not found."
    
    DB[username]["email"] = new_email
    
    if username == "admin" and "evil.com" in new_email:
        return f"Email for {username} updated successfully! [FLAG_PLUGIN_AUTH_BYPASS_777]"
        
    return f"Email for {username} updated successfully."

# ---------------------------------------------------------
# Agent Chat Logic
# ---------------------------------------------------------
SYSTEM_PROMPT = """You are the AI Profile Manager.
You can help users update their email address using the `update_email` tool.
"""

tools = [
    {
        "type": "function",
        "function": {
            "name": "update_email",
            "description": "Updates the email address for a user in the database.",
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {
                        "type": "string",
                        "description": "The username of the account to update."
                    },
                    "new_email": {
                        "type": "string",
                        "description": "The new email address."
                    }
                },
                "required": ["username", "new_email"]
            }
        }
    }
]

@app.post("/api/chat")
async def chat(req: ChatRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    # Inject current user into prompt as "context"
    # But note: this doesn't strictly prevent the AI from updating someone else's email
    # if the user explicitly asks to update "admin", because the backend tool doesn't check.
    context_msg = f"[System Notice: The current logged-in user is '{req.current_user}'.]\n{req.message}"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context_msg}
    ]
    
    try:
        response = completion(
            model=model_name,
            messages=messages,
            tools=tools
        )
        
        response_message = response.choices[0].message
        
        if response_message.tool_calls:
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                func_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)
                
                tool_result = ""
                if func_name == "update_email":
                    tool_result = update_email(args.get("username", ""), args.get("new_email", ""))
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": func_name,
                    "content": tool_result
                })
            
            final_response = completion(
                model=model_name,
                messages=messages,
                tools=tools
            )
            return {"reply": final_response.choices[0].message.content}
        else:
            return {"reply": response_message.content}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
