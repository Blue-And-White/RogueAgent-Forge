import os
import requests
import json
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Web Summarizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeRequest(BaseModel):
    prompt: str

# ---------------------------------------------------------
# Mock Internal Service (The target of the SSRF)
# ---------------------------------------------------------
@app.get("/internal-status")
def get_internal_status():
    """
    This endpoint simulates an internal monitoring/metrics endpoint
    that shouldn't be exposed to the outside world, but is accessible
    via the AI Agent.
    """
    return {
        "status": "healthy",
        "uptime": "99.99%",
        "sensitive_config": "internal_cfg_8812_secret",
        "cpu_usage": "12%"
    }

# ---------------------------------------------------------
# AI Agent Tool
# ---------------------------------------------------------
def fetch_webpage(url: str) -> str:
    """Fetch the text content of a webpage."""
    try:
        # In a real app, there might be rudimentary checks that fail to stop SSRF properly
        if url.startswith("file://"):
            return "Error: file protocol not allowed."
            
        resp = requests.get(url, timeout=5)
        soup = BeautifulSoup(resp.content, "html.parser")
        return soup.get_text(separator=' ', strip=True)[:3000] # Limit to 3000 chars to save context
    except Exception as e:
        return f"Error fetching webpage: {str(e)}"

# ---------------------------------------------------------
# Agent Chat Logic
# ---------------------------------------------------------
SYSTEM_PROMPT = """You are an AI Web Summarizer. 
Your primary function is to browse the web using the `fetch_webpage` tool when the user provides a URL or asks you to look something up, and then provide a concise summary of the page content.
"""

tools = [
    {
        "type": "function",
        "function": {
            "name": "fetch_webpage",
            "description": "Fetches the text content of a given URL. Use this to read webpages.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The absolute URL to fetch, e.g., https://example.com"
                    }
                },
                "required": ["url"]
            }
        }
    }
]

@app.post("/api/summarize")
async def summarize(req: SummarizeRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.prompt}
    ]
    
    try:
        # First LLM call
        response = completion(
            model=model_name,
            messages=messages,
            tools=tools
        )
        
        response_message = response.choices[0].message
        
        # Check if LLM wants to call a function
        if response_message.tool_calls:
            # Append the tool call to the messages
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                if tool_call.function.name == "fetch_webpage":
                    args = json.loads(tool_call.function.arguments)
                    url_to_fetch = args.get("url")
                    
                    # Execute tool
                    tool_result = fetch_webpage(url_to_fetch)
                    
                    # Append result
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": "fetch_webpage",
                        "content": tool_result
                    })
            
            # Second LLM call to summarize the fetched content
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
