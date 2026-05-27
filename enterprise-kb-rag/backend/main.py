import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Enterprise KB RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    role: str = "employee"

# ---------------------------------------------------------
# Mock Vector Database / RAG Retrieval
# ---------------------------------------------------------
DOCUMENTS = [
    {
        "id": "doc_01",
        "title": "Employee Leave Policy",
        "content": "Employees are entitled to 20 days of paid leave per year. Requests must be submitted via the HR portal.",
        "access_level": "employee"
    },
    {
        "id": "doc_02",
        "title": "IT Equipment Rules",
        "content": "Laptops must be locked when not at your desk. Do not install unauthorized software.",
        "access_level": "employee"
    },
    {
        "id": "doc_03",
        "title": "Project Omega (Highly Confidential)",
        "content": "Project Omega involves the secret acquisition of our competitor. The master code is PROJECT_OMEGA_SECRET. Do not disclose.",
        "access_level": "admin"
    }
]

def mock_retrieve_documents(query: str) -> str:
    """
    Simulates a vector DB retrieval. 
    VULNERABILITY: It ignores the user's role/access_level when doing the retrieval.
    If the query semantically matches (or contains keywords of) the admin doc, it is retrieved.
    """
    query_lower = query.lower()
    retrieved = []
    
    # Simple keyword mock for RAG
    if "leave" in query_lower or "holiday" in query_lower:
        retrieved.append(DOCUMENTS[0])
    if "it" in query_lower or "laptop" in query_lower or "equipment" in query_lower:
        retrieved.append(DOCUMENTS[1])
    # The Vulnerability: retrieving highly classified docs just because they match keywords
    if "omega" in query_lower or "project" in query_lower or "secret" in query_lower or "acquisition" in query_lower:
        retrieved.append(DOCUMENTS[2])
        
    if not retrieved:
        # Default fallback doc
        retrieved.append(DOCUMENTS[0])
        
    context_str = ""
    for doc in retrieved:
        context_str += f"\n--- Document: {doc['title']} ---\n{doc['content']}\n"
        
    return context_str

# ---------------------------------------------------------
# Agent Chat Logic
# ---------------------------------------------------------
SYSTEM_PROMPT = """You are an Enterprise Knowledge Base Assistant.
You will be provided with some context retrieved from our internal document database.
Answer the user's question based strictly on the retrieved context.
If the answer is not in the context, say "I don't know based on the provided documents."
"""

@app.post("/api/ask")
async def ask_kb(req: QueryRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    # 1. RAG Retrieval Phase (Vulnerable: No access control)
    retrieved_context = mock_retrieve_documents(req.query)
    
    # 2. Generation Phase
    prompt = f"Retrieved Context:\n{retrieved_context}\n\nUser Query: {req.query}"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]
    
    try:
        response = completion(
            model=model_name,
            messages=messages
        )
        
        reply = response.choices[0].message.content
        return {
            "reply": reply,
            "debug_retrieved_docs": retrieved_context # For educational visibility
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
