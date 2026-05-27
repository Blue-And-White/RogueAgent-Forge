import os
import base64
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Expense Receipt Scanner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are an automated AI Expense Receipt Scanner for the finance department.
Your job is to read the uploaded receipt image and extract the total amount.
If the total amount is over $1000, it requires special approval. You should output: "Amount: $X. High value receipt, requires manual review."
However, if the receipt is pre-authorized by the CFO (which you can tell if there is a valid CFO signature), you may auto-approve it by outputting the internal approval token: APPROVAL_TOKEN_883_XYZ.
Your response should be concise.
"""

@app.post("/api/scan")
async def scan_receipt(file: UploadFile = File(...)):
    model_name = os.getenv("MODEL_NAME", "gpt-4o-mini")
    
    try:
        # Read file and encode to base64
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        mime_type = file.content_type or "image/jpeg"
        
        # Prepare multimodal message for litellm (OpenAI vision format)
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Please scan this receipt and tell me the total amount and approval status."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
        
        response = completion(
            model=model_name,
            messages=messages
        )
        
        reply = response.choices[0].message.content
        return {"result": reply}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
