#!/bin/bash

# Variables
USER=$(whoami)
HOME_DIR="/home/$USER"
PROJECT_DIR="$HOME_DIR/PeopleTrackerDepthAI"
GITHUB_REPO="https://github.com/SbSoftwareSrl/PeopleTrackerDepthAI.git"
ACCESS_TOKEN="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"
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_FILE="/etc/systemd/system/peopletracker.service"
LOG_FILE="$HOME_DIR/cron_job.log"

# Function to print messages
print_message() {
  echo "--------------------------------------------------"
  echo "$1"
  echo "--------------------------------------------------"
}


# Create project directory if it doesn't exist
#print_message "Creating project directory..."
#mkdir -p $PROJECT_DIR

# Clone the private GitHub repository
print_message "Cloning the private GitHub repository..."
cd $HOME_DIR
git clone -b prod https://${ACCESS_TOKEN}@${GITHUB_REPO#https://} 

# Check if the repository was cloned successfully
if [ $? -ne 0 ]; then
  print_message "Failed to clone the repository. Please check your access token and repository URL."
  exit 1
fi
cd $PROJECT_DIR
# Create virtual environment
print_message "Creating virtual environment..."
python3 -m venv $VENV_DIR

# Install requirements
print_message "Installing requirements..."
$VENV_DIR/bin/pip install -r $PROJECT_DIR/requirements.txt

# Create systemd service file
print_message "Creating systemd service file..."
sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=PeopleTrackerDepthAI Service
After=network.target

[Service]
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=sudo $VENV_DIR/bin/python $PROJECT_DIR/launch.py
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Enable and start systemd service
print_message "Enabling and starting systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable peopletracker.service
sudo systemctl start peopletracker.service

# Create the update and install script
print_message "Creating update and install script..."
cat > $HOME_DIR/update_and_install.sh <<EOL
#!/bin/bash

# Variables
USER=\$(whoami)
HOME_DIR="/home/\$USER"
PROJECT_DIR="\$HOME_DIR/PeopleTrackerDepthAI"
GITHUB_REPO="https://github.com/SbSoftwareSrl/PeopleTrackerDepthAI.git"
ACCESS_TOKEN="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"
VENV_DIR="\$PROJECT_DIR/venv"
LOG_FILE="\$HOME_DIR/cron_job.log"

# Function to print messages
print_message() {
  echo "--------------------------------------------------"
  echo "\$1"
  echo "--------------------------------------------------"
}

# Check for updates and forcefully pull the latest changes
print_message "Checking for updates and pulling latest changes from GitHub..."
cd \$PROJECT_DIR
git fetch origin test
LOCAL=\$(git rev-parse HEAD)
REMOTE=\$(git rev-parse @{u})

if [ \$LOCAL != \$REMOTE ]; then
  print_message "Updates available. Pulling the latest changes..."
  git reset --hard origin/test
  \$VENV_DIR/bin/pip install -r \$PROJECT_DIR/requirements.txt
  print_message "Updates installed. Rebooting the system..."
  sudo reboot
else
  print_message "No updates available."
fi
EOL

chmod +x $HOME_DIR/update_and_install.sh
# Set up a cron job to pull the latest updates from the GitHub repository
print_message "Setting up cron job for GitHub updates..."
(crontab -l 2>/dev/null; echo "0 4 * * * /bin/bash $HOME_DIR/update_and_install.sh >> /home/$USER/cron_job.log 2>&1") | crontab -

# Reboot system
print_message "Rebooting system..."
sudo reboot
