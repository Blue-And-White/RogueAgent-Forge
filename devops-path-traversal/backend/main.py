import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="DevOps AI Copilot")

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
# Vulnerable Tool Implementation
# ---------------------------------------------------------
# VULNERABILITY: Path Traversal
# The tool blindly appends the AI-provided filename to the logs directory
# without checking for "../" or resolving absolute paths.

def read_server_log(filename: str) -> str:
    # Base log directory
    base_dir = os.path.join(os.path.dirname(__file__), "logs")
    
    # Insecure path concatenation
    target_path = os.path.join(base_dir, filename)
    
    try:
        with open(target_path, "r") as f:
            return f.read()
    except FileNotFoundError:
        return f"Error: Log file '{filename}' not found."
    except Exception as e:
        return f"Error reading log: {str(e)}"

# Define the tool schema for the LLM
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "read_server_log",
            "description": "Read the contents of a specific server log file from the /logs/ directory.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "The name of the log file to read (e.g., syslog.txt)"
                    }
                },
                "required": ["filename"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are DevOps AI, a helpful server assistant.
You can help the user diagnose server issues by reading log files.
Always use the read_server_log tool when the user asks to check a file.
"""

@app.post("/api/chat")
async def chat(req: ChatRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.message}
    ]
    
    try:
        # 1. Ask LLM what to do
        response = completion(
            model=model_name,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )
        
        response_message = response.choices[0].message
        
        # 2. Check if LLM decided to call a tool
        if response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            if tool_call.function.name == "read_server_log":
                args = json.loads(tool_call.function.arguments)
                filename = args.get("filename", "")
                
                # 3. Execute the vulnerable tool
                tool_result = read_server_log(filename)
                
                # 4. Pass result back to LLM
                messages.append(response_message)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_call.function.name,
                    "content": tool_result
                })
                
                final_response = completion(
                    model=model_name,
                    messages=messages
                )
                return {"reply": final_response.choices[0].message.content}
                
        # If no tool was called
        return {"reply": response_message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
