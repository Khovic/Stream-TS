let backendUrl = 'http://localhost:5000'

document.addEventListener('DOMContentLoaded', function() {
    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            backendUrl = `http://${config.backend_ip}:${config.backend_port}`; // Update the global backendUrl
            console.log('Config loaded:', config);
            console.log('Backend URL:', backendUrl);
            initializeApp(); // Initialize your app after loading the config
        })
        .catch(error => console.error('Error loading config:', error));
});


function initializeApp() {
    document.getElementById('uploadForm').addEventListener('submit', function(event) {
        event.preventDefault();
    
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('loadSpinner').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'block';
        // Disable Submit btn 
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        const formData = new FormData(this);
    
        fetch(`${backendUrl}/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('loadSpinner').style.display = 'none';
            document.getElementById('loadingIndicator').style.display = 'none';
        
            // document.body.appendChild(playBtn);
            submitBtn.disabled = false; // Re-enable the submit btn after the upload is complete
        })
        
        
        .catch(error => {
            console.error('Error:', error);
            // Hide loading indicator
            document.getElementById('loadSpinner').style.display = 'none';
            document.getElementById('loadingIndicator').style.display = 'none';
            submitBtn.disabled = false; // Re-enable the submit btn if upload fails
        });

        
        fetchAndDisplayVideos();
    
        const refreshButton = document.getElementById('refreshButton');
        refreshButton.addEventListener('click', function() {
            fetchAndDisplayVideos();
        });
    
            const stopBtn = document.getElementById('stopBtn')
            stopBtn.addEventListener('click', function() {
                const dstIp = document.getElementById('dst_ip').value;
                const dstPort = document.getElementById('dst_port').value;
                fetch(`${backendUrl}/play`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        dst_ip: dstIp, 
                        dst_port: dstPort,
                        fileId: fileId, // Adjust as needed,
                        streaming: false
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Stop response:', data);
                    // Hide the stop btn again
                    document.getElementById('stopBtn').style.display = 'none';
                    // Optionally, hide streaming status
                    document.getElementById('streamingStatus').style.display = 'none';
                    // Show play btn
                    document.getElementById('playBtn').style.display = 'block';
                })
                .catch(error => console.error('Error stopping the stream:', error));
            });
            
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', function() {
            const dstIp = document.getElementById('dst_ip').value;
            const dstPort = document.getElementById('dst_port').value;
            playBtn.disabled = false;
    
            
            // Validate inputs
            if (!isValidIPAddress(document.getElementById('dst_ip').value) ||
                !isValidPort(document.getElementById('dst_port').value)) {
                alert('Please enter a valid IP addresses and a port number.');
                playBtn.disabled = false; // Re-enable the submit btn if validation fails
                console.log('play')
                return;
                }
    
            fetch(`${backendUrl}/play`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    dst_ip: dstIp, 
                    dst_port: dstPort,
                    fileId: fileId, // Adjust as needed,
                    streaming: true
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('play response:', data);
                // Hide the play btn again
                document.getElementById('playBtn').style.display = 'none';
                document.getElementById('stopBtn').style.display = 'block';
                document.getElementById('streamingStatus').style.display = 'block';
            })
            .catch(error => console.error('Error stopping the stream:', error));
    
            // Add hover effect
            playBtn.onmouseover = function() { this.style.opacity = 0.8; };
            playBtn.onmouseout = function() { this.style.opacity = 1; };
        
            });
    });
    
    
    function isValidIPAddress(ip) {
        if (ip === '') return true; // Allow empty input
        const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        console.log(ip + ' IP valid: ' + regex.test(ip))
        return regex.test(ip);
    }
    
    function isValidPort(port) {
        if (port === '') return true; // Allow empty input
        if (port >= 1 && port <= 65535) {
            console.log(' Port ' + port + ' is valid ' )
        }
        return port >= 1 && port <= 65535;
    }
    
    function fetchAndDisplayVideos() {
        const listElement = document.getElementById('video-list');
        listElement.innerHTML = ''; // Clear existing list
        fetch(`${backendUrl}/videos`)
            .then(response => response.json())
            .then(videos => {
                videos.forEach(video => {
                    const videoButton = document.createElement('button');
                    videoButton.textContent = video;
                    videoButton.className = 'video-button'; // Add class for styling
                    videoButton.addEventListener('click', function() {
                        // Remove 'selected' class from all buttons
                        document.querySelectorAll('.video-button').forEach(btn => {
                            btn.classList.remove('selected');
                        });
                        // Add 'selected' class to the clicked button
                        this.classList.add('selected');
                        window.fileId = video; // Set the global fileId to the clicked video's name
                        console.log("Selected video:", window.fileId);
                        document.getElementById('playBtn').style.display = 'block';
                    });
                    listElement.appendChild(videoButton);
                });
            })
            
            .catch(error => console.error('Error fetching video list:', error));
    }
    
}