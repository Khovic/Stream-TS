import socket, time, os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# # Configuration
# udp_ip = "127.0.0.1"  # Target IP address
# udp_port = 32000  # Target port
# ts_file = "videos/video2.ts"  # Path to the TS file

def play_ts(udp_ip, udp_port, ts_file): 
    # Create a socket for UDP
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    try:
        while True:  # Loop indefinitely
            # Open the TS file
            with open(ts_file, "rb") as file:
                while True:
                    # Read a chunk of the file
                    data = file.read(2048)  # Adjust the chunk size as needed

                    if not data:
                        break  # If end of file, break and restart the loop

                    # Send the data to the specified UDP address and port
                    sock.sendto(data, (udp_ip, udp_port))
                    
                    # Optionally, add a slight delay to avoid overwhelming the network
                    time.sleep(1)  # Adjust delay as needed (remove the comment to enable)

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
        dst_ip = request.form['dst_ip']
        dst_port = int(request.form['dst_port'])
        file.save(os.path.join('videos', file.filename))
        print(f'dst_ip: {dst_ip} \n dst_port: {dst_port}')
        return jsonify({"message": "File processed successfully"})


@app.route('/play', methods=['POST'])
def play_file():
    data = request.get_json()  # Get the JSON data sent from the frontend
    dst_ip = data['dst_ip']
    dst_port = int(data['dst_port'])
    file_id = data.get('fileId')  # Assuming you're identifying the file in some way

    # Assuming the file path needs to be determined by file_id
    ts_file_path = f'videos/{file_id}'

    play_ts(dst_ip, dst_port, ts_file_path)

    return jsonify({"message": "File is being played"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)