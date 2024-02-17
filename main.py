import socket, time, os, threading
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# # Configuration
# udp_ip = "127.0.0.1"  # Target IP address
# udp_port = 32000  # Target port
# ts_file = "videos/video2.ts"  # Path to the TS file

streaming = False

def play_ts(udp_ip, udp_port, ts_file): 
    # Create a socket for UDP
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    global streaming
    print(f'{udp_ip}, {udp_port}, {ts_file}, {streaming}')

    try:
        while streaming == True:  # Loop indefinitely
            # Open the TS file
            with open(ts_file, "rb") as file:
                while streaming == True:  
                    # Read a chunk of the file
                    data = file.read(4096)  # Adjust the chunk size as needed

                    if not data:
                        break  # If end of file, break and restart the loop

                    # Send the data to the specified UDP address and port
                    sock.sendto(data, (udp_ip, udp_port))
                    
                    # add a slight delay to avoid overwhelming the network
                    time.sleep(0.01)  # Adjust delay as needed

    except KeyboardInterrupt:
        print("Streaming stopped by user")
        

    finally:
        # Close the socket
        sock.close()
        print("Socket closed. Exiting.")


# Flask integration
@app.route('/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        # Receive file and data from the request
        file = request.files['file']
        file.save(os.path.join('videos', file.filename))
        return jsonify({f"message": "File uploaded successfully"})


@app.route('/play', methods=['POST'])
def play_file():
    data = request.get_json()  # Get the JSON data sent from the frontend
    dst_ip = data['dst_ip']
    dst_port = int(data['dst_port'])
    file_id = data.get('fileId')  # Assuming you're identifying the file in some way

    global streaming 
    streaming = data.get('streaming') # True to activate streaming thread, False to sto

    # Assuming the file path needs to be determined by file_id
    ts_file_path = f'videos/{file_id}'
    t1= threading.Thread(target=play_ts, args=[dst_ip, dst_port, ts_file_path])
    if streaming:
        t1.start()
        return jsonify({"message": "Stream Started"}), 200

    if not streaming:
        streaming = False
        return jsonify({"message": "Stream Stopped"}), 200
    else:
        return jsonify({"message": "bool empty?"}), 200

@app.route('/videos', methods=['GET'])
def list_videos():
    video_directory = 'videos'
    videos = os.listdir(video_directory)
    return jsonify(videos)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)