import uvicorn
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text 
from app.database import get_db

app = FastAPI()

@app.get("/")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1")) 
        return {"message": "Database connected successfully"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
