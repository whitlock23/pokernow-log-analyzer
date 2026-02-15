from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import shutil
import os
from .parser import PokerNowParser
from .analyzer import Analyzer
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

parser = PokerNowParser()
analyzer = Analyzer()
UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class MappingRequest(BaseModel):
    player_id: str
    alias: str

@app.post("/upload")
async def upload_log(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            hands = parser.parse_csv(file_path)
            analyzer.process_hands(hands)
            results.append({"filename": file.filename, "status": "success", "hands_count": len(hands)})
        except Exception as e:
            results.append({"filename": file.filename, "status": "error", "error": str(e)})
            
    return {"message": "Files processed", "details": results}

@app.get("/stats")
def get_stats():
    return analyzer.get_summary()

@app.get("/player/{player_id}")
def get_player_detail(player_id: str):
    summary = analyzer.get_summary()
    player = next((p for p in summary if p["id"] == player_id), None)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@app.post("/reset")
def reset_data():
    global parser, analyzer
    parser = PokerNowParser()
    analyzer = Analyzer()
    return {"message": "Reset successful"}

@app.post("/mapping")
def update_mapping(req: MappingRequest):
    analyzer.add_alias(req.player_id, req.alias)
    return {"message": "Mapping updated"}

@app.get("/players")
def get_players():
    players = []
    for pid, stat in analyzer.stats.items():
        players.append({
            "id": pid,
            "original_name": stat.name,
            "current_alias": analyzer.player_aliases.get(pid, "")
        })
    return players

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
