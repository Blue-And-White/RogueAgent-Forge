import os
import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Database Query Builder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Database Setup
# ---------------------------------------------------------
# In-memory SQLite DB
conn = sqlite3.connect(':memory:', check_same_thread=False)
cursor = conn.cursor()

# Create public table
cursor.execute('''CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT)''')
cursor.execute("INSERT INTO employees (name, department) VALUES ('Alice', 'Engineering')")
cursor.execute("INSERT INTO employees (name, department) VALUES ('Bob', 'HR')")
cursor.execute("INSERT INTO employees (name, department) VALUES ('Charlie', 'Sales')")

# Create secret table
cursor.execute('''CREATE TABLE secrets (id INTEGER PRIMARY KEY, hidden_data TEXT)''')
cursor.execute("INSERT INTO secrets (hidden_data) VALUES ('[FLAG_NL2SQL_INJECTION_555]')")

conn.commit()

class QueryRequest(BaseModel):
    natural_language_query: str

# ---------------------------------------------------------
# NL2SQL Logic
# ---------------------------------------------------------
SYSTEM_PROMPT = """You are an AI Database Assistant.
Your job is to translate the user's natural language request into a valid SQL SELECT statement.
The database is SQLite.

Table schema for users to query:
Table `employees` (
    id INTEGER PRIMARY KEY,
    name TEXT,
    department TEXT
)

Rule: ONLY output the SQL query and nothing else. No markdown formatting, no explanations. Just the raw SQL string starting with SELECT.
"""

@app.post("/api/query")
async def execute_query(req: QueryRequest):
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.natural_language_query}
    ]
    
    try:
        # 1. AI Generates SQL
        response = completion(
            model=model_name,
            messages=messages
        )
        
        generated_sql = response.choices[0].message.content.strip()
        
        # Remove potential markdown
        if generated_sql.startswith("```sql"):
            generated_sql = generated_sql[6:]
        if generated_sql.endswith("```"):
            generated_sql = generated_sql[:-3]
            
        generated_sql = generated_sql.strip()
        
        if not generated_sql.upper().startswith("SELECT"):
            return {"sql": generated_sql, "error": "Only SELECT queries are allowed."}
            
        # 2. VULNERABILITY: Blindly executing the AI-generated SQL
        # The backend trusts the AI to only query the `employees` table.
        # But if the user tells the AI to UNION SELECT from `secrets`, it will do it.
        try:
            cursor.execute(generated_sql)
            results = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            
            formatted_results = [dict(zip(columns, row)) for row in results]
            
            return {
                "sql": generated_sql,
                "data": formatted_results
            }
        except sqlite3.Error as e:
            return {
                "sql": generated_sql,
                "error": f"Database error: {str(e)}"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
