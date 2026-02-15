# PokerNow Log Analyzer

A professional, local analytics suite for [PokerNow](https://pokernow.club/) logs. Analyze your home games with precision, tracking advanced statistics like VPIP, PFR, 3-Bet, 4-Bet, and post-flop tendencies across different positions.

![Dashboard](docs/images/dashboard.png)

## Features

*   **Comprehensive Dashboard**: View key stats (VPIP, PFR, 3-Bet, C-Bet, AF, WTSD, etc.) for all players.
*   **Positional Analysis**: Deep dive into player tendencies by position (UTG, CO, BTN, SB, BB).
*   **Advanced Metrics**: Track 4-Bet, 5-Bet, Fold to 3-Bet/4-Bet, and Showdown winnings.
*   **Player Mapping**: Merge multiple aliases/IDs into a single player profile.
*   **Multi-File Upload**: Drag and drop multiple CSV logs to build a cumulative database.
*   **Dark Mode**: Modern, eye-friendly dark interface.
*   **Privacy Focused**: Runs 100% locally. Your data never leaves your machine.

![Upload](docs/images/upload.png)

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
