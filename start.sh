#!/bin/bash
# Start Nginx in the background
nginx &

# Start main.py and keep it in the foreground
exec python3 -u main.py