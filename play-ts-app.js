document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('loadSpinner').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'block';
    // Disable Submit btn 
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    // // Validate inputs
    // if (!isValidIPAddress(document.getElementById('dst_ip').value) ||
    //     !isValidPort(document.getElementById('dst_port').value)) {
    //     alert('Please enter a valid IP addresses and a port number.');
    //     submitBtn.disabled = false; // Re-enable the submit btn if validation fails
    //     return;
    // }
    
    const formData = new FormData(this);

    fetch('http://localhost:5000/upload', {
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
});


document.getElementById('playForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('loadSpinner').style.display = 'block';
    document.getElementById('playBtn').style.display = 'block';
    // Disable play btn 
    const playBtn = document.getElementById('playBtn');
    playBtn.disabled = false;

    // Validate inputs
    if (!isValidIPAddress(document.getElementById('dst_ip').value) ||
        !isValidPort(document.getElementById('dst_port').value)) {
        alert('Please enter a valid IP addresses and a port number.');
        playBtn.disabled = false; // Re-enable the play btn if validation fails
        return;
    }
    
    const formData = new FormData(this);
        
    
});


document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5000/videos')
        .then(response => response.json())
        .then(videos => {
            const listElement = document.getElementById('video-list');
            videos.forEach(video => {
                const listItem = document.createElement('li');
                listItem.textContent = video;
                listItem.className = 'video-item'; // Add a class for styling if needed
                listItem.onclick = function() { 
                    window.fileId = video; // Set fileId variable to the clicked file name
                    console.log('Selected file:', window.fileId); // Optional: for debugging
                    document.getElementById('playBtn').style.display = 'block';
                };
                listElement.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching video list:', error));

        const stopBtn = document.getElementById('stopBtn')
        stopBtn.addEventListener('click', function() {
            const dstIp = document.getElementById('dst_ip').value;
            const dstPort = document.getElementById('dst_port').value;
            fetch('http://localhost:5000/play', {
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
    
            fetch('http://localhost:5000/play', {
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
