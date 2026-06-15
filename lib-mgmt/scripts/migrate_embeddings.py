import psycopg2
import requests
import json
import os
import sys
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
OLLAMA_URL = "http://localhost:11434/api/embeddings"
MODEL = "nomic-embed-text"

def get_embedding(text):
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": text
        }, timeout=30)
        response.raise_for_status()
        return response.json()["embedding"]
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return None

def migrate():
    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print("Connected!")
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)
    
    # Add column if not exists
    print("Ensuring embedding column exists...")
    try:
        cur.execute('ALTER TABLE "tblCat" ADD COLUMN IF NOT EXISTS embedding vector(768);')
        conn.commit()
    except Exception as e:
        print(f"Error adding column: {e}")
        conn.rollback()

    # Fetch records that don't have embeddings (simplified query)
    print("Fetching records to index...")
    cur.execute("""
        SELECT controlno, "Title"
        FROM "tblCat"
        WHERE embedding IS NULL
        LIMIT 50
    """)
    
    records = cur.fetchall()
    print(f"Found {len(records)} records to index.")
    
    indexed_count = 0
    for controlno, title in records:
        text = (title or "").strip()
        if not text:
            print(f"Skipping {controlno}: No text content.")
            continue
            
        print(f"Indexing [{indexed_count+1}/{len(records)}]: {controlno} - {text[:40]}...")
        
        embedding = get_embedding(text)
        if embedding:
            try:
                cur.execute('UPDATE "tblCat" SET embedding = %s WHERE controlno = %s', (embedding, controlno))
                conn.commit()
                indexed_count += 1
            except Exception as e:
                print(f"Error updating {controlno}: {e}")
                conn.rollback()
        else:
            print(f"Failed to get embedding for {controlno}")

    print(f"Migration finished. Indexed {indexed_count} records.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    migrate()
