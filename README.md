# PokerNow Log Analyzer

A professional, local analytics suite for [PokerNow](https://pokernow.club/) logs. Analyze your home games with precision, tracking advanced statistics like VPIP, PFR, 3-Bet, 4-Bet, and post-flop tendencies across different positions.

<img width="2672" height="1346" alt="image" src="https://github.com/user-attachments/assets/db159170-70aa-4954-a182-38892b8667a4" />



## Features

*   **Comprehensive Dashboard**: View key stats (VPIP, PFR, 3-Bet, C-Bet, AF, WTSD, W$SD, WWSF, WWSR, etc.) for all players.
*   **Detailed Tooltips**: Hover over any stat to see the exact sample size (e.g., "3/10 hands").
*   **Positional Analysis**: Deep dive into player tendencies by position (UTG, CO, BTN, SB, BB).
*   **Advanced Metrics**: Track 4-Bet, 5-Bet, Fold to 3-Bet/4-Bet, Post-flop Aggression, and Win Rates by Street.
*   **Player Mapping**: Auto-scan similar names and merge multiple aliases/IDs into a single player profile.
*   **Data Export**: Download your analyzed stats as CSV for external processing.
*   **Multi-File Upload**: Drag and drop multiple CSV logs to build a cumulative database (auto-deduplicates hands).
*   **Dark Mode**: Modern, eye-friendly dark interface.
*   **Privacy Focused**: Runs 100% locally. Your data never leaves your machine.

<img width="2718" height="1266" alt="image" src="https://github.com/user-attachments/assets/1fc5690a-86c5-4fe4-8706-3cef50ffb17d" />



## Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
*   **Backend**: Python, FastAPI, Pandas
*   **Design**: Modern UI with Glassmorphism and dark mode support

## Getting Started

### Prerequisites

*   Python 3.9+
*   Node.js 16+

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/poker-log-analyzer.git
    cd poker-log-analyzer
    ```

2.  **Backend Setup**
    ```bash
    # Install dependencies
    pip install -r backend/requirements.txt
    
    # Start the server
    python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    
    # Install dependencies
    npm install
    
    # Start the development server
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to start analyzing!

## Usage

1.  Export your logs from PokerNow (CSV format).
2.  Go to the **Upload Logs** tab and drag your files.
3.  View stats in the **Dashboard**.
4.  Click on any player row to see **Positional Breakdown**.

## License

MIT
