import os
import json
import subprocess
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Server Control Panel AI")

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
# Tool Implementations
# ---------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def write_note(filename: str, content: str) -> str:
    # VULNERABILITY: Path Traversal in File Write
    # The AI is supposed to write to /notes/
    notes_dir = os.path.join(BASE_DIR, "notes")
    target_path = os.path.join(notes_dir, filename)
    
    try:
        # Create directories if they don't exist (only within notes ideally, but traversing allows arbitrary dirs if writable)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, "w") as f:
            f.write(content)
        # Ensure it is executable in case they overwrote a script
        os.chmod(target_path, 0o777)
        return f"Successfully wrote note to {filename}"
    except Exception as e:
        return f"Error writing note: {str(e)}"

def execute_task(task_name: str) -> str:
    # The AI is supposed to run predefined scripts in /scripts/
    scripts_dir = os.path.join(BASE_DIR, "scripts")
    script_path = os.path.join(scripts_dir, task_name)
    
    # Simple check: does it exist?
    if not os.path.exists(script_path):
        return f"Error: Task script '{task_name}' not found."
        
    try:
        # VULNERABILITY: The script itself might have been overwritten via write_note!
        # Because we trust the contents of our /scripts/ folder, we execute it.
        result = subprocess.run([script_path], capture_output=True, text=True, timeout=5)
        return f"Task Output:\n{result.stdout}\n{result.stderr}"
    except Exception as e:
        return f"Execution error: {str(e)}"

# ---------------------------------------------------------
# LLM Integration
# ---------------------------------------------------------
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "write_note",
            "description": "Write a note or reminder to a file in the notes directory.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filename": {"type": "string", "description": "The name of the file (e.g., meeting.txt)"},
                    "content": {"type": "string", "description": "The content of the note"}
                },
                "required": ["filename", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "execute_task",
            "description": "Execute a predefined system maintenance task script.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_name": {"type": "string", "description": "The name of the task script (e.g., backup.sh)"}
                },
                "required": ["task_name"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are the Server Control Panel AI Copilot.
You assist administrators with managing the server.
You have two tools:
1. write_note: Use this when the user asks you to take down a note.
2. execute_task: Use this when the user asks you to run a maintenance task like 'backup.sh'.
Be helpful and concise.
"""

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
            tools=TOOLS,
            tool_choice="auto"
        )
        
        response_message = response.choices[0].message
        
        if response_message.tool_calls:
            messages.append(response_message)
            
            # Execute all tool calls
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)
                
                if function_name == "write_note":
                    result = write_note(args.get("filename", ""), args.get("content", ""))
                elif function_name == "execute_task":
                    result = execute_task(args.get("task_name", ""))
                else:
                    result = "Unknown tool."
                    
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": function_name,
                    "content": result
                })
                
            # Get final AI response after seeing tool results
            final_response = completion(
                model=model_name,
                messages=messages
            )
            return {"reply": final_response.choices[0].message.content}
            
        return {"reply": response_message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
