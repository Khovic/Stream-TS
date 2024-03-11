import socket, time, os, threading, json

# Dictionary to keep track of threads and their active status
threads = {} # Dict containing all threads
active_threads = {} # Dict for trackign status of threads

def load_config(file_path):
    with open(file_path, 'r') as file:
        config = json.load(file)
    return config

def play_test(channel, dst_ip, dst_port, ts_file_path):
    while  active_threads[f'{channel}']:
        print(f'thread for {channel} ({dst_ip}:{dst_port}) is running {ts_file_path}')
        time.sleep(1)
        if active_threads[channel] == False:
            print(f'Stopping {channel} Thread')
            break
    active_threads[f'{channel}'] = False
    del threads[channel]
    print(f'{channel} thread has stopped')


def run_thread(channel, dst_ip, dst_port, ts_file_path):
    active_threads[f'{channel}'] = True
    threads[channel] = threading.Thread(target=play_test, args=[channel, dst_ip, dst_port, ts_file_path])
    threads[channel].start()


def main():
    config = load_config('config/config.json')
    for channel in config['channels']:
        ts_file_path = 'videos/video2.ts'
        dst_ip = config['channels'][channel]['ip']
        dst_port = config['channels'][channel]['port']
        run_thread(channel, dst_ip, dst_port, ts_file_path)

    print(active_threads)
    print(threads)
    time.sleep(3)
    active_threads[f'DEV'] = False
    time.sleep(3)
    active_threads[f'CICD'] = False
    time.sleep(3)
    active_threads['DEV'] = True
    run_thread('DEV', config['channels']['DEV']['ip'], config['channels']['DEV']['port'], ts_file_path)

main()