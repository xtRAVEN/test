## Quick Start Guide

This guide will help you set up, customize, and run your app.

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Install Docker and Docker Compose on your system
   - [Docker Installation Guide](https://docs.docker.com/get-docker/)
   - [Docker Compose Installation Guide](https://docs.docker.com/compose/install/)

2. Download the project
   - Go to the GitHub repository
   - Click on 'Code' and then 'Download ZIP'
   - Extract the ZIP file to your preferred location

### Customizing Your App

#### Changing the App Logo
1. Prepare your logo image file
2. Place the logo file in the `app/dist/pastehere` directory

#### Changing the App Name and Logo
1. Open the file `app/templates/index.html` in a text editor
2. Look for the following code block:
   ```html
   <script>
    window.APP_CONFIG = {
      siteName: "Your app name",
      logoPath: "{% static 'app logo name for example=> starr.png' %}",
    };
   </script>


Change "Your app name" to your desired app name
Replace "starr.png" with the filename of your logo (the one you placed in app/dist/pastehere)

Running the Application

Open a terminal or command prompt
Navigate to the extracted project folder
Run this command:
docker-compose up -d --build

The -d flag runs the containers in detached mode (in the background).

Ensuring the Application Runs on System Reboot
To make sure Docker starts on system boot:

On Windows:

Open Task Manager
Click on the 'Startup' tab
Ensure 'Docker Desktop' is enabled


On Mac:

Go to System Preferences > Users & Groups
Click on your user account, then click 'Login Items'
Add Docker to the list of applications that start on login


On Linux:
Enable the Docker service to start on boot:
sudo systemctl enable docker

Accessing Your App
Once the application is running, you can access it in the following ways:

On the host device (the computer running Docker):
Open your web browser and go to:

http://127.0.0.1:8000

From other devices on the same local network:
Open a web browser on any device connected to the same local network and go to:

http://[hosted-computer-ip-address]:8000

Replace [hosted-computer-ip-address] with the actual IP address of the computer running the Docker container.
To find the IP address of the host computer:

On Windows: Open Command Prompt and type ipconfig
On Mac/Linux: Open Terminal and type ifconfig or ip addr show

Look for the IPv4 address under your active network adapter (usually Wi-Fi or Ethernet).

Note: Ensure that your firewall settings allow incoming connections on port 8000 for other devices to access the application.
Stopping the Application
To stop the application, run:

docker-compose down

Troubleshooting

Ensure Docker is running before trying to start the application
For Windows users: Check that WSL 2 is properly set up if using Docker Desktop
Check your system's firewall settings if you have connection issues
For permission errors, try running the terminal as Administrator (Windows) or with sudo (Mac/Linux)

Additional Information

Application data is persisted in Docker volumes and will be preserved between restarts
To completely reset the application, you may need to remove the Docker volumes

Need Help?
If you encounter any issues or have questions, please open an issue on the GitHub repository.
Important Reminder
Always run docker-compose up -d --build after making changes to ensure they are incorporated into the application and it runs in the background.
