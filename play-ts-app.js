let backendUrl = "http://localhost:5000";
window.preconfiguredChannels = [];
window.fileId = "null";
window.streamingActive = false;
window.channelsJson = '';

document.addEventListener("DOMContentLoaded", function () {
  fetch("config/config.json")
    .then((response) => response.json())
    .then((config) => {
      backendUrl = `http://${config.backend_ip}:${config.backend_port}`; // Update the global backendUrl
      console.log("Config loaded:", config);
      console.log("Backend URL:", backendUrl);
      window.channelsJson = JSON.stringify(config.channels)
      console.log(channelsJson)
      initializeApp(); // Initialize your app after loading the config
      createChannelButtons(channelsJson)
    })
    .catch((error) => console.error("Error loading config:", error));
});

function initializeApp() {
  uploadVideoFile();
  stopStream();
  playStream();
  deleteVideoFile()
  fetchAndDisplayVideos();
  const intervalId = setInterval(checkStreamStatus, 3000); // 5000 milliseconds = 5 seconds
}

function stopStream() {
  const stopBtn = document.getElementById("stopBtn");
  stopBtn.style.background='#FFBF00'
  stopBtn.addEventListener("click", function () {
    const dstIp = document.getElementById("dst_ip").value;
    const dstPort = document.getElementById("dst_port").value;
    const requestBody = {
      streaming: false, // Include any non-optional fields
    };

    // Check if each variable has a value and add it to the requestBody if so
    if (dstIp) {
      requestBody.dst_ip = dstIp;
    }
    if (dstPort) {
      requestBody.dst_port = dstPort;
    }
    if (window.fileId) {
      requestBody.fileId = window.fileId;
    }
    fetch(`${backendUrl}/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Stop response:", data);
        // Hide the stop btn again
        document.getElementById("stopBtn").disabled = 'true';
        document.getElementById("stopBtn").classList.add('button-disabled');
        // Optionally, hide streaming status
        document.getElementById("streamingStatus").style.display = "none";
        // Show play btn
        document.getElementById("playBtn").disabled = 'true';
        document.getElementById("playBtn").classList.add('button-disabled');
      })
      .catch((error) => console.error("Error stopping the stream:", error));
  });
}

function playStream() {
    const playBtn = document.getElementById("playBtn");
    playBtn.addEventListener("click", function () {
      const dstIp = document.getElementById("dst_ip").value;
      const dstPort = document.getElementById("dst_port").value;
      playBtn.disabled = false;

      // Validate inputs
      if (
        !isValidIPAddress(document.getElementById("dst_ip").value) ||
        !isValidPort(document.getElementById("dst_port").value) ||
        !window.fileId.endsWith(".ts")
      ) {
        alert("Please enter a valid IP addresses and a port number.");
        playBtn.disabled = false; // Re-enable the submit btn if validation fails
        console.log("play");
        return;
      }

      fetch(`${backendUrl}/play`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dst_ip: dstIp,
          dst_port: dstPort,
          fileId: window.fileId, // Adjust as needed,
          streaming: true,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("play response:", data);
          // Disable the play btn again
          document.getElementById("playBtn").disabled = true;
          document.getElementById("playBtn").classList.add('button-disabled');
        })
        .catch((error) => console.error("Error stopping the stream:", error));

      // Add hover effect
      playBtn.onmouseover = function () {
        this.style.opacity = 0.8;
      };
      playBtn.onmouseout = function () {
        this.style.opacity = 1;
      };
    });
}

function uploadVideoFile() {
  document
    .getElementById("uploadForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Show loading indicator
      document.getElementById("loadingIndicator").style.display = "block";
      document.getElementById("loadSpinner").style.display = "block";
      document.getElementById("submitBtn").disabled = 'true';
        document.getElementById("submitBtn").classList.add('button-disabled');
      // Disable Submit btn
      const submitBtn = document.getElementById("submitBtn");
      submitBtn.disabled = true;
      const formData = new FormData(this);

      fetch(`${backendUrl}/upload`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          document.getElementById("loadSpinner").style.display = "none";
          document.getElementById("loadingIndicator").style.display = "none";

          submitBtn.disabled = false; // Re-enable the submit btn after the upload is complete
          fetchAndDisplayVideos();
        })

        .catch((error) => {
          console.error("Error:", error);
          // Hide loading indicator
          document.getElementById("loadSpinner").style.display = "none";
          document.getElementById("loadingIndicator").style.display = "none";
          submitBtn.disabled = false; // Re-enable the submit btn if upload fails
        });
    });
}

function deleteVideoFile() {
  const deleteBtn = document.getElementById("deleteBtn");
  deleteBtn.style.background='#FF0000';
  deleteBtn.addEventListener("click", function () {
    const isConfirmed = confirm(`Are you sure you want to delete ${window.fileId}?`);
    if (isConfirmed) {
      console.log("delete pressed");
      deleteBtn.disabled = false
      // Validate inputs
      if (
        !window.fileId.endsWith(".ts")
      ) {
        alert("Invalid file selected");
        deleteBtn.disabled = false; // Re-enable the submit btn if validation fails
        console.log("delete");
        return;
      }

      fetch(`${backendUrl}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: window.fileId, // Adjust as needed,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("delete response:", data);
          // Hide the delete btn again
          document.getElementById("deleteBtn").disabled = true;
          document.getElementById("deleteBtn").classList.add('button-disabled');
        })
        .catch((error) => console.error("Error deleting the file", error));

      setTimeout(function() {
        fetchAndDisplayVideos();
      }, (1 * 300));
    } else {
      console.log("Delete Canceled")
    }
    // Add hover effect
    deleteBtn.onmouseover = function () {
      this.style.opacity = 0.8;
      this.style.background-color 
    };
    deleteBtn.onmouseout = function () {
      this.style.opacity = 1;
    };
    this.style.background-color;
  });
}

function isValidIPAddress(ip) {
  if ((ip === "") & (window.streamingActive === true)) return true; // Allow empty input
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  console.log(ip + " IP valid: " + regex.test(ip));
  return regex.test(ip);
}

function isValidPort(port) {
  if ((port === "") & (window.streamingActive === true)) return true; // Allow empty input
  if (port >= 1 && port <= 65535) {
    console.log(" Port " + port + " is valid ");
  }
  return port >= 1 && port <= 65535;
}

function fetchAndDisplayVideos() {
  const listElement = document.getElementById("video-list");
  listElement.innerHTML = ""; // Clear existing list
  fetch(`${backendUrl}/videos`)
    .then((response) => response.json())
    .then((videos) => {
      videos.forEach((video) => {
        const videoButton = document.createElement("button");
        videoButton.textContent = video;
        videoButton.className = "video-button"; // Add class for styling
        videoButton.addEventListener("click", function () {
          // Remove 'selected' class from all buttons
          document.querySelectorAll(".video-button").forEach((btn) => {
            btn.classList.remove("selected");
          });
          // Add 'selected' class to the clicked button
          this.classList.add("selected");
          window.fileId = video; // Set the global fileId to the clicked video's name
          console.log("Selected video:", window.fileId);
          if (!window.streamingActive & window.fileId.endsWith(".ts")) {
            document.getElementById("playBtn").disabled = false;
            document.getElementById("playBtn").classList.remove('button-disabled');
            document.getElementById("channelsContainer").style.display = "block";
          }
          if (!window.streamingActive & window.fileId.endsWith(".ts")) {
            document.getElementById("stopBtn").disabled = false;
            document.getElementById("deleteBtn").classList.remove('button-disabled');
          }
        });
        listElement.appendChild(videoButton);
      });
    })
    
    .catch((error) => console.error("Error fetching video list:", error));
}

function checkStreamStatus() {
  fetch(`${backendUrl}/stream_status`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      window.activeChannel = data.activeChannel
      window.streamingActive = data.streamingActive;
      console.log(data); // Process the response data
      if (window.streamingActive) {

        let channelExists = preconfiguredChannels.find(item => item.value === window.activeChannel);
        if (channelExists) {
          document.getElementById('streamingStatus').textContent = `Currently Streaming to ${channelExists.name}`;
        } else {
          document.getElementById('streamingStatus').textContent = `Currently Streaming to ${window.activeChannel}`;
        }
        document.getElementById("streamingStatus").style.display = "block";
        document.getElementById("stopBtn").disabled = false;
        document.getElementById("stopBtn").classList.remove('button-disabled');
        document.getElementById("playBtn").disabled = true;
        document.getElementById("playBtn").classList.add('button-disabled');
        document.getElementById("deleteBtn").disabled = true;
        document.getElementById("deleteBtn").classList.add('button-disabled');
        
      } else {
        // console.log("Streaming is not active.");
        document.getElementById("streamingStatus").style.display = "none";
        document.getElementById("stopBtn").disabled = true;
        document.getElementById("stopBtn").classList.add('button-disabled');
        if (fileId.endsWith(".ts") == true) {
          document.getElementById("playBtn").disabled = false;
          document.getElementById("playBtn").classList.remove('button-disabled');
          document.getElementById("channelsContainer").style.display = "block";
          document.getElementById("deleteBtn").disabled = false;
          document.getElementById("deleteBtn").classList.remove('button-disabled');
        }
      }
      // createChannelButtons(window.channelsJson)
    })
    .catch((error) => console.error("Error fetching streaming status:", error));
}

function streamCommand(channelName, channelInfo) {
  console.log(`Channel: ${channelName}, IP: ${channelInfo.ip}, Port: ${channelInfo.port}`);

  if (
    !isValidIPAddress(channelInfo.ip) ||
    !isValidPort(channelInfo.port) ||
    !window.fileId.endsWith(".ts")
  ) {
    alert("Invalid config.json or no TS file selected");
    console.log("play");
    return;
  }

  fetch(`${backendUrl}/play`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dst_ip: channelInfo.ip,
      dst_port: channelInfo.port,
      fileId: window.fileId, // Adjust as needed,
      streaming: true
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("play response:", data);
      
    })
    .catch((error) => console.error("Error stopping the stream:", error));


}

function stopStreamCommand(channelName, channelInfo) {
    const requestBody = {
      streaming: false, // Include any non-optional fields
      channelName: channelName,
    };

    // Check if each variable has a value and add it to the requestBody if so
    if (channelInfo.ip) {
      requestBody.dst_ip = channelInfo.ip;
    }
    if (channelInfo.port) {
      requestBody.dst_port = channelInfo.port;
    }
    if (window.fileId) {
      requestBody.fileId = window.fileId;
    }
    fetch(`${backendUrl}/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Stop response:", data);
      })
      .catch((error) => console.error("Error stopping the stream:", error));
}

function createChannelButtons(channelsJson) {
  // Assuming channelsJson is a JSON string; parse it to an object
  const channels = JSON.parse(channelsJson);
  console.log(channels)

  // Find the container where you want to append the buttons
  const container = document.getElementById('channelsContainer');

  // Iterate over each channel in the object
  for (const [channelName, channelInfo] of Object.entries(channels)) {
      // Create a new button element
      const button = document.createElement('button');
      button.textContent = `Stream to ${channelName}`; // Set the button's text to the channel name
      button.style.background='#00ced1';
      button.style.width = "29.9%";
      button.id = `channel${channelName}Btn`;
      
      // Add channels to list
      window.preconfiguredChannels.push({name: `${channelName}`, value: `${channelInfo.ip}:${channelInfo.port}`})
      console.log(`${window.preconfiguredChannels[0].name}:${window.preconfiguredChannels[0].value}`)
      // Add an event listener to log the IP and port when the button is clicked
      button.addEventListener('click', function() {
          console.log(`Channel: ${channelName}, IP: ${channelInfo.ip}, Port: ${channelInfo.port}`);

          if (!window.streamingActive) {
            streamCommand(channelName, channelInfo);
            button.style.backgroundColor = '#900C3F';
            button.textContent = `Stop Streaming to ${channelName}`;
            button.style.width = "29.9%";
          } else {
            stopStreamCommand(channelName, channelInfo);
            button.style.backgroundColor = '#00ced1';
            button.textContent = `Stream to ${channelName}`;
            button.style.width = "29.9%";
            
          }

          // Add hover effect
          button.onmouseover = function () {
            this.style.opacity = 0.8;
          };
          button.onmouseout = function () {
            this.style.opacity = 1;
          };

      });

      // Append the button to the container
      container.appendChild(button);
  }
}