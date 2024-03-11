import socket, time, os, threading, json

# Dictionary to keep track of threads and their active status
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
        if active_threads[channel] == False:
            print('Stopping Thread')
            break
    print(f'{channel} thread has stopped')


def start_thread(channel, dst_ip, dst_port, ts_file_path,):
    thread_status = active_threads[f'{channel}']
    while thread_status:
        print(f'thread for {channel} ({dst_ip}:{dst_port}) is running {ts_file_path}')
        time.sleep(1)
        if thread_status == False:
            print(f'Stopping {channel} Thread')
            break
    print(f'{channel} thread has stopped')




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
    time.sleep(3)
    active_threads[f'CICD'] = False
    del threads['DEV']
    time.sleep(3)
    active_threads['DEV'] = True
    threads['DEV'] = threading.Thread(target=play_test, args=['DEV', dst_ip, dst_port, ts_file_path, active_threads[f'DEV']])
    threads['DEV'].start()

main()