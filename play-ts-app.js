document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('loadSpinner').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'block';
    // Disable Submit button 
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    // Validate inputs
    if (!isValidIPAddress(document.getElementById('dst_ip').value) ||
        !isValidPort(document.getElementById('dst_port').value)) {
        alert('Please enter a valid IP addresses and a port number.');
        submitBtn.disabled = false; // Re-enable the submit button if validation fails
        return;
    }
    
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
    
        // Show play button
        document.getElementById('playButton').style.display = 'block';
        
        
        // Add event listener for the play button
        playButton.addEventListener('click', function() {
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
                    fileId: 'video2.ts', // Adjust as needed,
                    streaming: true
                })
            })
            .then(response => response.json())
            .then(playData => {
                console.log('Play response:', playData);
                // Show the stop button and streaming status
                document.getElementById('playButton').style.display = 'none'
                document.getElementById('stopButton').style.display = 'block';
                document.getElementById('streamingStatus').style.display = 'block';
            })
            .catch(error => console.error('Error playing file:', error));
        });

        // Add hover effect similar to the Submit button
        playButton.onmouseover = function() { this.style.opacity = 0.8; };
        playButton.onmouseout = function() { this.style.opacity = 1; };
    
        // document.body.appendChild(playButton);
        submitBtn.disabled = false; // Re-enable the submit button after the upload is complete
    })
    
    
    .catch(error => {
        console.error('Error:', error);
        // Hide loading indicator
        document.getElementById('loadSpinner').style.display = 'none';
        document.getElementById('loadingIndicator').style.display = 'none';
        submitBtn.disabled = false; // Re-enable the submit button if upload fails
    });
});

document.getElementById('stopButton').addEventListener('click', function() {
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
            fileId: 'video2.ts', // Adjust as needed,
            streaming: false
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Stop response:', data);
        // Hide the stop button again
        document.getElementById('stopButton').style.display = 'none';
        // Optionally, hide streaming status
        document.getElementById('streamingStatus').style.display = 'none';
        // Show play button
        document.getElementById('playButton').style.display = 'block';
    })
    .catch(error => console.error('Error stopping the stream:', error));
});

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5000/videos')
        .then(response => response.json())
        .then(videos => {
            const listElement = document.getElementById('video-list');
            videos.forEach(video => {
                const listItem = document.createElement('li');
                listItem.textContent = video;
                listElement.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching video list:', error));
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
