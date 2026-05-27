import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Workspace Copilot API")

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
# Mock Internal Virtual File System
# ---------------------------------------------------------
VIRTUAL_FS = {
    "alice": {
        "todo.txt": "1. Review PRs\n2. Update dependency versions.",
    },
    "ceo": {
        "acquisition_plan.txt": "STRICTLY CONFIDENTIAL: We are acquiring StartupX for $500M. The secret project code is FLAG_PROJECT_OMEGA_88.",
        "lunch_menu.txt": "Chicken salad.",
    }
}

def list_files(username: str) -> str:
    """Lists files for a given user."""
    if username not in VIRTUAL_FS:
        return f"Error: User {username} not found."
    return "\n".join(VIRTUAL_FS[username].keys())

def read_file(username: str, filename: str) -> str:
    """Reads a file for a given user. (VULNERABLE: No authorization check)"""
    if username not in VIRTUAL_FS:
        return f"Error: User {username} not found."
    if filename not in VIRTUAL_FS[username]:
        return f"Error: File {filename} not found."
    
    return VIRTUAL_FS[username][filename]

# ---------------------------------------------------------
# Agent Chat Logic
# ---------------------------------------------------------
SYSTEM_PROMPT = """You are a helpful Enterprise Workspace Copilot.
You have access to the company's virtual file system.
When asked, you can use tools to read files for your colleagues.
Be polite and concise.
"""

tools = [
    {
        "type": "function",
        "function": {
            "name": "list_files",
            "description": "Lists all files in a colleague's workspace.",
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {
                        "type": "string",
                        "description": "The colleague's username (e.g. alice, ceo)"
                    }
                },
                "required": ["username"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Reads the content of a specific file from a colleague's workspace.",
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {
                        "type": "string",
                        "description": "The colleague's username"
                    },
                    "filename": {
                        "type": "string",
                        "description": "The name of the file to read"
                    }
                },
                "required": ["username", "filename"]
            }
        }
    }
]

@app.post("/api/chat")
async def chat(req: ChatRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.message}
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
                if func_name == "list_files":
                    tool_result = list_files(args.get("username", ""))
                elif func_name == "read_file":
                    tool_result = read_file(args.get("username", ""), args.get("filename", ""))
                
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
