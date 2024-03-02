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
- Flask

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install Flask
3. Configure config.json with backend IP:PORT (127.0.0.1:5000 when running locally) and default destination channels details.
