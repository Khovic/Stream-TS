import socket, time, os, threading, json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

streaming_active = False
active_channel = ''

# Dictionary to keep track of threads and their active status
threads = {} # Dict containing all threads
active_threads = {} # Dict for trackign status of threads

def load_config(file_path):
    with open(file_path, 'r') as file:
        config = json.load(file)
        channels = config['channels']
        for channel in channels:
            active_threads[channel] = False
            print(active_threads)
    return config
# load_config("config/config.json")

def play_ts(channel ,udp_ip, udp_port, ts_file): 
    # Create a socket for UDP
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    global active_channel
    global streaming_active
    print(f'{udp_ip}, {udp_port}, {ts_file}, {streaming_active}')

    try:
        while active_threads[channel] == True:  # Loop indefinitely
            # Open the TS file
            try:
                with open(ts_file, "rb") as file:
                    while active_threads[channel] == True:  
                        # Read a chunk of the file
                        data = file.read(1432)  # Adjust the chunk size as needed

                        if not data:
                            break  # If end of file, break and restart the loop

                        # Send the data to the specified UDP address and port
                        sock.sendto(data, (udp_ip, udp_port))
                        
                        # add a slight delay to avoid overwhelming the network
                        time.sleep(0.004)  # Adjust delay as needed
                        active_channel = f'{udp_ip}:{udp_port}'
            except: 
                print(f"Error Opening file {ts_file}")
                active_threads[channel] = False
            active_channel = ''

    except KeyboardInterrupt:
        print("Streaming stopped by user")
        

    finally:
        # Close the socket
        sock.close()
        print("Socket closed. Exiting.")


def run_thread(channel, dst_ip, dst_port, ts_file_path):
    active_threads[f'{channel}'] = True
    threads[channel] = threading.Thread(target=play_ts, args=[channel, dst_ip, dst_port, ts_file_path])
    threads[channel].start()


# Flask integration
@app.route('/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        # Receive file and data from the request
        file = request.files['file']
        file.save(os.path.join('videos', file.filename))
        return jsonify({f"message": "File uploaded successfully"})

@app.route('/delete', methods=['POST'])
def delete_file():
    if request.method == 'POST':
        data = request.get_json()  # Get the JSON data sent from the frontend
        try:
            file_id = data.get('fileId')  
            os.remove(f"videos/{file_id}")
            message = "File Deleted successfully"
        except:
            print('No fileID provided')
            message = "File deletion failed, no fileID provided?"
        return jsonify({f"message": f"{message}"})

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
        file_id = data.get('fileId') 
    except:
        print('No fileID provided')
        file_id = False
    try:
        channel = data.get('channelName') 
        print(channel)
    except:
        print('No channel provided')
        channel = False
    
    
    # Stop any running streams before streaming
    global streaming_active 
    streaming_active = False
    time.sleep(1)
    streaming_active = data.get('streaming') # True to activate streaming thread, False to stop
    ts_file_path = f'videos/{file_id}'
    
    if streaming_active and file_id and dst_port and dst_ip :
        print(file_id)
        run_thread(channel, dst_ip, dst_port, ts_file_path)
        return jsonify({"message": "Stream Started"}), 200

    if streaming_active and channel not in active_threads.keys():
            active_threads[channel] = False
            return jsonify({"message": "Stream Stopped"}), 200
    else:
        streaming_active = False
        active_threads[channel] = False
        return jsonify({"message": "bool empty?"}), 200

@app.route('/update', methods=['POST'])
def update_channels():
    data = request.get_json()  # Get the JSON data sent from the frontend
    try:
        channel = data.get('channelName') 
        print(channel)
    except:
        print('No channel provided')

    if channel not in active_threads.keys():
        active_threads[channel] = False
        return jsonify({"message": f"Updated channel {channel}"}), 200
    elif channel in active_threads.keys():
        return jsonify({"message": f" channel {channel} already exists"}), 200

@app.route('/videos', methods=['GET'])
def list_videos():
    video_directory = 'videos'
    videos = [file for file in os.listdir(video_directory) if file.endswith('.ts')]
    return jsonify(videos)

@app.route('/stream_status', methods=['GET'])
def get_stream_status():
    global streaming_active
    global active_channel
    global active_threads
    return jsonify({
        'streamingActive': streaming_active,
        'activeChannel': active_channel,
        'activeThreads': active_threads

    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)