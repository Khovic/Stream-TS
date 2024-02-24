import socket, time, os, threading, json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

streaming_active = False

def load_config(file_path):
    with open(file_path, 'r') as file:
        config = json.load(file)
        channels = config['channels']
    return config

def play_ts(udp_ip, udp_port, ts_file): 
    # Create a socket for UDP
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    global streaming_active
    print(f'{udp_ip}, {udp_port}, {ts_file}, {streaming_active}')

    try:
        while streaming_active == True:  # Loop indefinitely
            # Open the TS file\
            try:
                with open(ts_file, "rb") as file:
                    while streaming_active == True:  
                        # Read a chunk of the file
                        data = file.read(1472)  # Adjust the chunk size as needed

                        if not data:
                            break  # If end of file, break and restart the loop

                        # Send the data to the specified UDP address and port
                        sock.sendto(data, (udp_ip, udp_port))
                        
                        # add a slight delay to avoid overwhelming the network
                        time.sleep(0.004)  # Adjust delay as needed
            except: 
                print(f"Error Opening file {ts_file}")
                streaming_active = False

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


@app.route('/play', methods=['POST', 'PUT'])
def play_file():
    data = request.get_json()  # Get the JSON data sent from the frontend
    try:
        dst_ip = data['dst_ip']
    except:
        print('No dst_ip provided')
        dst_ip = False
    try:
        dst_port = int(data['dst_port'])
    except: 
        print('No dst_port provided')
        dst_port = False
    try:
        file_id = data.get('fileId')  # Assuming you're identifying the file in some way
    except:
        print('No fileID provided')
        file_id = False
        
    # Stop any running streams before streaming
    global streaming_active 
    streaming_active = False
    time.sleep(1)
    streaming_active = data.get('streaming') # True to activate streaming thread, False to sto
    # Assuming the file path needs to be determined by file_id
    ts_file_path = f'videos/{file_id}'
    
    if streaming_active and file_id and dst_port and dst_ip :
        t1= threading.Thread(target=play_ts, args=[dst_ip, dst_port, ts_file_path])
        t1.start()
        return jsonify({"message": "Stream Started"}), 200

    if not streaming_active:
        streaming_active = False
        return jsonify({"message": "Stream Stopped"}), 200
    else:
        streaming_active = False
        return jsonify({"message": "bool empty?"}), 200
    

@app.route('/videos', methods=['GET'])
def list_videos():
    video_directory = 'videos'
    videos = [file for file in os.listdir(video_directory) if file.endswith('.ts')]
    return jsonify(videos)

@app.route('/stream_status', methods=['GET'])
def get_stream_status():
    global streaming_active
    return jsonify({
        'streamingActive': streaming_active,
        'message': 'Streaming is currently active.' if streaming_active else 'Streaming is not active.'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)