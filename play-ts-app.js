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
  customChannelPlay();
  deleteVideoFile();
  fetchAndDisplayVideos();
  const intervalId = setInterval(checkStreamStatus, 1000); // 1000 milliseconds = 1 second
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
            document.getElementById("channelCUSTOMBtn").disabled = false;
            document.getElementById("channelCUSTOMBtn").classList.remove('button-disabled');
            document.getElementById("channelsContainer").style.display = "block";
          }
          if (!window.streamingActive & window.fileId.endsWith(".ts")) {
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
      window.activeThreads = data.activeThreads
      Object.entries(activeThreads).forEach(([key, value]) => {
        document.getElementById(`channel${key}Btn`).disabled = false;
        if (value) {
          document.getElementById(`channel${key}Btn`).style.backgroundColor = '#900C3F';
          document.getElementById(`channel${key}Btn`).textContent = `Stop Streaming to ${key}`;
          document.getElementById(`channel${key}Btn`).style.width = "29.9%";
        } else {
          document.getElementById(`channel${key}Btn`).style.backgroundColor = '#005ed1';
          document.getElementById(`channel${key}Btn`).textContent = `Stream to ${key}`;
          document.getElementById(`channel${key}Btn`).style.width = "29.9%";
        }
      });
      console.log(data); // Process the response data
      if (window.streamingActive) {
        let channelExists = preconfiguredChannels.find(item => item.value === window.activeChannel);
        if (channelExists) {
          document.getElementById('streamingStatus').textContent = `Currently Streaming to ${channelExists.name}`;
        } else {
          document.getElementById('streamingStatus').textContent = `Currently Streaming to ${window.activeThreads}`;
        }
        document.getElementById("streamingStatus").style.display = "block";
        document.getElementById("channelCUSTOMBtn").classList.add('button-disabled');
        document.getElementById("deleteBtn").disabled = true;
        document.getElementById("deleteBtn").classList.add('button-disabled');
        
      } else {
        // console.log("Streaming is not active.");
        document.getElementById("streamingStatus").style.display = "none";
        if (fileId.endsWith(".ts") == true) {
          document.getElementById("channelCUSTOMBtn").disabled = false;
          document.getElementById("channelCUSTOMBtn").classList.remove('button-disabled');
          document.getElementById("channelsContainer").style.display = "block";
          document.getElementById("deleteBtn").disabled = false;
          document.getElementById("deleteBtn").classList.remove('button-disabled');
        }
      }
    })
    .catch((error) => console.error("Error fetching streaming status:", error));
}

function addStreamToSet(channelName) {
  const requestBody = {
    streaming: null, // Include any non-optional fields
    channelName: channelName
  };

  fetch(`${backendUrl}/update`, {
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

  console.log("Pushing preconfigured Channels")
}

function streamCommand(channelName, channelInfo) {
  console.log(channelInfo);

  if (
    !isValidIPAddress(channelInfo.ip) ||
    !isValidPort(channelInfo.port) ||
    !window.fileId.endsWith(".ts")
  ) {
    alert("Invalid configuration or no TS file selected");
    return;
  }

  fetch(`${backendUrl}/play`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channelName: channelName,
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
  window.channels = channels 
  const container = document.getElementById('channelsContainer');

  // Iterate over each channel in the object
  for (const [channelName, channelInfo] of Object.entries(channels)) {
      // Create a new button element
      const button = document.createElement('button');
      button.textContent = `Stream to ${channelName}`; // Set the button's text to the channel name
      button.style.background='gray';
      button.style.width = "29.9%";
      button.id = `channel${channelName}Btn`;
      button.disabled = true;

      // Add channels to list
      window.preconfiguredChannels.push({name: `${channelName}`, value: `${channelInfo.ip}:${channelInfo.port}`})
      console.log(`${window.preconfiguredChannels[0].name}:${window.preconfiguredChannels[0].value}`)
      // Add an event listener to log the IP and port when the button is clicked
      button.addEventListener('click', function() {
          console.log(`Channel: ${channelName}, IP: ${channelInfo.ip}, Port: ${channelInfo.port}`);
          if (!window.activeThreads[channelName]) {
            streamCommand(channelName, channelInfo);
          } else {
            stopStreamCommand(channelName, channelInfo);
          }

          // Add hover effect
          button.onmouseover = function () {
            this.style.opacity = 0.8;
          };
          button.onmouseout = function () {
            this.style.opacity = 1;
          };

      });
      addStreamToSet(channelName);
      // Append the button to the container
      container.appendChild(button);
  }
}

function customChannelPlay() {
  const channelCUSTOMBtn = document.getElementById("channelCUSTOMBtn");
  document.getElementById("channelCUSTOMBtn").disabled = 'true';
      document.getElementById("channelCUSTOMBtn").classList.add('button-disabled');
  channelName = 'CUSTOM'
  addStreamToSet(channelName, null);
  channelCUSTOMBtn.addEventListener('click', function() {
    const dstIp = document.getElementById("dst_ip").value;
    const dstPort = document.getElementById("dst_port").value;
    let channelInfo = { 'ip': dstIp, 'port': dstPort }
    console.log(`Channel: ${channelName}, ip: ${channelInfo.ip}, port: ${channelInfo.port}`);
    if (!window.activeThreads[channelName]) {
      streamCommand(channelName, channelInfo);
    } else {
      stopStreamCommand(channelName, channelInfo);
    }
  });
};
