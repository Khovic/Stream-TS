# Start with the Nginx image # nginx-python3:0.0.1
FROM nginx 

# Install Python 3
RUN apt-get update \
    && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Copy the application files to the container
COPY index.html /usr/share/nginx/html
COPY play-ts-app.js /usr/share/nginx/html
COPY config /usr/share/nginx/html
COPY favicon.ico /usr/share/nginx/html

# Install python dependencies
RUN mkdir -p /app
COPY main.py requirements.txt start.sh /app/
RUN rm /usr/lib/python3.11/EXTERNALLY-MANAGED
WORKDIR /app
RUN pip3 install -r requirements.txt
RUN mkdir -p videos

# (Optional) Copy a custom Nginx config
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 5000
EXPOSE 80
EXPOSE 5000

# Start Nginx when the container has provisioned
RUN nginx -g 'daemon on;'
CMD ["bash", "start.sh"]
