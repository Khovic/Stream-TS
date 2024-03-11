import socket, time, os, threading, json

# Dictionary to keep track of threads and their stop flags
threads = {}
active_threads = {}

def load_config(file_path):
    with open(file_path, 'r') as file:
        config = json.load(file)
    return config

def play_test(channel, dst_ip, dst_port, ts_file_path , active_thread):

    while active_thread:
        print(f'thread for {channel} ({dst_ip}:{dst_port}) is running {ts_file_path}')
        time.sleep(1)
    print(f'{channel} thread has stopped')

# # Function to start a thread for a specific key:value pair
# def start_thread(key, value):
#     active_thread = threading.Event()  # Create a stop flag for this thread
#     thread = threading.Thread(target=play_test, args=(key, value, active_thread), name=key)
#     threads[key] = thread
#     active_threads[key] = active_thread
#     thread.start()

# # Function to stop a thread by key
# def stop_thread(key):
#     active_thread = active_threads.get(key)
#     if active_thread:
#         active_thread.set()  # Set the stop flag
#         threads[key].join()  # Wait for the thread to finish
#         del threads[key]  # Remove the thread from the dictionary
#         del active_threads[key]  # Remove the stop flag from the dictionary



def main():
    config = load_config('config/config.json')
    for channel in config['channels']:
        ts_file_path = 'videos/video2.ts'
        active_threads[f'{channel}'] = True
        dst_ip = config['channels'][channel]['ip']
        dst_port = config['channels'][channel]['port']
        threads[channel] = threading.Thread(target=play_test, args=[channel, dst_ip, dst_port, ts_file_path, active_threads[f'{channel}']])

    print(active_threads)
    print(threads)
    threads['CICD'].start()
    threads['DEV'].start()

    time.sleep(3)
    active_threads[f'DEV'] = False

    
main()