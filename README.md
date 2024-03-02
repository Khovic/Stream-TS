Video Streaming Application
This Video Streaming Application allows users to upload, select, and stream .ts (Transport Stream) video files through a simple web interface. It leverages Flask for the backend and vanilla JavaScript for the frontend, providing functionalities such as video upload, dynamic channel button creation, and streaming control.

Features
Video Upload: Users can upload .ts video files to the server.
Dynamic Channel Selection: The application dynamically generates buttons for predefined channels, allowing users to select a channel for video streaming.
Streaming Control: Users can start and stop video streaming with dedicated controls.
Configuration Management: The backend supports loading configuration details from a JSON file, including backend IP/port and channel information.
Getting Started
Prerequisites
Python 3.x
Flask
A modern web browser
Installation
Clone the repository or download the source code.
Install required Python packages:
sh
Copy code
pip install Flask
Place your .ts video files in a designated directory accessible to the Flask application.
Configuration
Edit the config.json file to set the backend IP/port and define the channels:

json
Copy code
{
    "backend_ip": "127.0.0.1",
    "backend_port": "5000",
    "channels": {
        "CICD": {
            "ip": "127.0.0.1",
            "port": "32000"
        },
        "DEV": {
            "ip": "127.0.0.2",
            "port": "32001"
        }
    }
}
Running the Application
Start the Flask backend server:
sh
Copy code
python main.py
Open index.html in your web browser to access the application.
Usage
Uploading Videos: Use the "Choose file" button and "Submit" to upload new .ts video files.
Selecting Channels: Click on the dynamically generated channel buttons to select a channel for streaming.
Streaming Videos: Use the "Play" and "Stop" buttons to control the streaming of the selected video.
Contributing
Contributions to this project are welcome. Please fork the repository and submit pull requests with your improvements.

License
This project is licensed under the MIT License - see the LICENSE file for details.

