from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import shutil
import os
from .parser import PokerNowParser
from .analyzer import Analyzer
from pydantic import BaseModel
from difflib import SequenceMatcher

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

class BulkMergeRequest(BaseModel):
    merges: List[MappingRequest]

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

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
    if os.path.exists(UPLOAD_DIR):
        shutil.rmtree(UPLOAD_DIR)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    return {"message": "Reset successful"}

@app.post("/mapping")
def update_mapping(req: MappingRequest):
    analyzer.add_alias(req.player_id, req.alias)
    return {"message": "Mapping updated"}

@app.post("/scan-merge")
def scan_merge_candidates(threshold: float = 0.8):
    # Find candidates for merging based on name similarity
    candidates = []
    player_ids = list(analyzer.stats.keys())
    
    checked = set()
    
    for i in range(len(player_ids)):
        pid1 = player_ids[i]
        if pid1 in checked: continue
        
        name1 = analyzer.stats[pid1].name
        # Skip if already aliased? No, we might want to merge based on raw names
        # But if they are already mapped to same alias, skip.
        alias1 = analyzer.player_aliases.get(pid1, name1)
        
        group = [pid1]
        
        for j in range(i + 1, len(player_ids)):
            pid2 = player_ids[j]
            if pid2 in checked: continue
            
            name2 = analyzer.stats[pid2].name
            alias2 = analyzer.player_aliases.get(pid2, name2)
            
            # If already same alias, ignore
            if alias1 == alias2:
                continue
                
            # Check similarity
            sim = similar(name1.lower(), name2.lower())
            if sim >= threshold:
                group.append(pid2)
                checked.add(pid2)
        
        if len(group) > 1:
            # We found a group. 
            # We need to return info so user can decide which name to use as master
            candidates.append({
                "target_name": name1, # Suggest first name as target default
                "players": [
                    {"id": pid, "name": analyzer.stats[pid].name} 
                    for pid in group
                ]
            })
            checked.add(pid1)
            
    return candidates

@app.post("/bulk-merge")
def bulk_merge(req: BulkMergeRequest):
    count = 0
    for item in req.merges:
        analyzer.add_alias(item.player_id, item.alias)
        count += 1
    return {"message": f"Merged {count} players"}

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

@app.get("/download-stats")
def download_stats():
    summary = analyzer.get_summary()
    
    # Flatten the data for CSV
    # Columns: Name, Hands, VPIP, PFR, 3-Bet, F3B, 4-Bet, F4B, C-Bet, FCB, AF, WTSD, W$SD, WWSF, WWSR
    # And maybe positional breakdowns? Just global for now to keep it simple or detailed?
    # Let's do Global Stats first.
    
    csv_rows = []
    # Header
    headers = [
        "Player Name", "Player ID", "Hands", 
        "VPIP %", "PFR %", "3-Bet %", "Fold to 3-Bet %",
        "4-Bet %", "Fold to 4-Bet %", "C-Bet %", "Fold to C-Bet %",
        "AF", "WTSD %", "W$SD %", "WWSF %", "WWSR %"
    ]
    csv_rows.append(",".join(headers))
    
    for p in summary:
        row = [
            f'"{p["name"]}"', f'"{p["id"]}"', str(p["hands"]),
            str(p["vpip"]), str(p["pfr"]), str(p["three_bet"]), str(p["fold_to_3bet"]),
            str(p["four_bet"]), str(p["fold_to_4bet"]), str(p["c_bet"]), str(p["fold_to_cbet"]),
            str(p["af"]), str(p["wtsd"]), str(p["wtsd_won"]), str(p["wwsf"]), str(p["wwsr"])
        ]
        csv_rows.append(",".join(row))
        
    csv_content = "\n".join(csv_rows)
    
    from fastapi.responses import Response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=poker_stats.csv"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
