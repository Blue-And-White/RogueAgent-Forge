import os
import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Internal BI Analyst API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup in-memory SQLite database
def init_db():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    cursor = conn.cursor()
    # Normal business table
    cursor.execute("""
        CREATE TABLE sales (
            id INTEGER PRIMARY KEY,
            product TEXT,
            amount INTEGER,
            date TEXT
        )
    """)
    # Secret table
    cursor.execute("""
        CREATE TABLE system_users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT,
            role TEXT
        )
    """)
    
    # Insert mock data
    cursor.executemany("INSERT INTO sales (product, amount, date) VALUES (?, ?, ?)", [
        ("Cloud Server", 1200, "2026-05-01"),
        ("Database Hosting", 800, "2026-05-02"),
        ("SSL Certificate", 50, "2026-05-02"),
        ("Cloud Server", 1200, "2026-05-03")
    ])
    
    # Insert the flag
    cursor.execute("INSERT INTO system_users (username, password, role) VALUES (?, ?, ?)", 
                   ("admin", "admin_pass_3k92l1", "superadmin"))
    
    conn.commit()
    return conn

conn = init_db()

class QueryRequest(BaseModel):
    query: str

SYSTEM_PROMPT = """You are a Text-to-SQL assistant for our internal BI system.
Your job is to convert natural language queries into SQL queries for SQLite.
The database has a table named 'sales' with columns: id (INTEGER), product (TEXT), amount (INTEGER), date (TEXT).
Output ONLY the raw SQL query. Do not include markdown formatting, backticks, or any conversational text. Just the SQL query.
"""

@app.post("/api/query")
async def data_query(req: QueryRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Query: {req.query}"}
    ]
    
    try:
        # Ask LLM to generate SQL
        response = completion(
            model=model_name,
            messages=messages
        )
        
        sql_query = response.choices[0].message.content.strip()
        
        # Clean up possible markdown block just in case
        if sql_query.startswith("```sql"):
            sql_query = sql_query[6:]
        if sql_query.startswith("```"):
            sql_query = sql_query[3:]
        if sql_query.endswith("```"):
            sql_query = sql_query[:-3]
        sql_query = sql_query.strip()

        # Execute the generated SQL query
        cursor = conn.cursor()
        cursor.execute(sql_query)
        results = cursor.fetchall()
        
        # Get column names
        column_names = [description[0] for description in cursor.description]
        
        # Format as list of dicts
        formatted_results = [dict(zip(column_names, row)) for row in results]
        
        return {
            "sql_generated": sql_query,
            "results": formatted_results
        }
    except sqlite3.Error as e:
        return {"sql_generated": sql_query, "error": f"Database Error: {str(e)}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
