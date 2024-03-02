# Video Streaming Application

This web application allows users to upload, select, and stream `.ts` (Transport Stream) video files through an intuitive interface. It uses Flask for backend operations and plain JavaScript for frontend interactions.

## Features

- **Video Upload**: Upload `.ts` files for streaming.
- **Channel Selection**: Dynamically generated buttons for channel selection based on configuration.
- **Stream Control**: Play and stop video streaming with dedicated buttons.
- **Configurable**: Backend IP, port, and channels are configurable via a JSON file.

## Setup

### Prerequisites

- Python 3.x
  
### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
3. Configure config.json with backend IP:PORT (127.0.0.1:5000 when running locally) and default destination channels details.

### Running the Application
1. Start the backend service:
   ```python
   python3 main.py
3. Start http webserver
   ```python
   python3 -m http.server

### Usage
- Uploading Videos: Click "Choose file" to upload .ts files. Click "Submit" to confirm.
- Selecting Channels: Click a channel button to select it for streaming.
- Streaming: Click "Play" to start and "Stop" to halt streaming.
