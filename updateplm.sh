#!/bin/bash

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

# Detect the real user even if running as sudo
if [ "$EUID" -eq 0 ]; then
  REAL_USER=${SUDO_USER:-$(whoami)}
else
  REAL_USER=$(whoami)
fi

HOME_DIR="/home/$REAL_USER"
PROJECT_DIR="$HOME_DIR/PeopleTrackerDepthAI"
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_FILE="/etc/systemd/system/peopletracker.service"
UPDATE_SCRIPT="$HOME_DIR/update_and_install.sh"
LOG_FILE="$HOME_DIR/cron_job.log"

# GitHub Credentials
GH_USER="pcarioca"
GH_TOKEN="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"
GH_REPO_URL="github.com/SbSoftwareSrl/PeopleTrackerDepthAI.git"
BRANCH="beta_test"

# --------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------
print_message() {
  echo "--------------------------------------------------"
  echo "$1"
  echo "--------------------------------------------------"
}

# --------------------------------------------------
# MAIN SETUP
# --------------------------------------------------

print_message "Configuring for User: $REAL_USER"
print_message "Home Directory: $HOME_DIR"

# 1. Clean up existing directory to ensure fresh clone
if [ -d "$PROJECT_DIR" ]; then
    print_message "Removing existing project directory to avoid conflicts..."
    rm -rf "$PROJECT_DIR"
fi

# 2. Clone the repository
# We use https://USER:TOKEN@github.com format which is more reliable
print_message "Cloning branch '$BRANCH'..."
cd "$HOME_DIR"

git clone -b "$BRANCH" "https://${GH_USER}:${GH_TOKEN}@${GH_REPO_URL}" "$PROJECT_DIR"

if [ $? -ne 0 ]; then
  print_message "CRITICAL ERROR: Failed to clone. Please verify your Token is valid and has 'repo' scope."
  exit 1
fi

# 3. Fix permissions (since we are running as sudo, we must give ownership back to the user)
print_message "Fixing file permissions..."
chown -R "$REAL_USER:$REAL_USER" "$PROJECT_DIR"

cd "$PROJECT_DIR" || exit 1

# 4. Create virtual environment
# We run this as the REAL USER, not root, to keep permissions clean
print_message "Creating virtual environment..."
sudo -u "$REAL_USER" python3 -m venv "$VENV_DIR"

# 5. Install requirements
print_message "Installing requirements..."
sudo -u "$REAL_USER" "$VENV_DIR/bin/pip" install --upgrade pip
sudo -u "$REAL_USER" "$VENV_DIR/bin/pip" install -r "$PROJECT_DIR/requirements.txt"

# 6. Create systemd service file
print_message "Creating systemd service file..."
cat > "$SERVICE_FILE" <<EOL
[Unit]
Description=PeopleTrackerDepthAI Service ($BRANCH)
After=network.target

[Service]
WorkingDirectory=$PROJECT_DIR
ExecStart=$VENV_DIR/bin/python $PROJECT_DIR/launch.py
Restart=always
RestartSec=10
# Run as root to access hardware/GPIO
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOL

# 7. Enable and start systemd service
print_message "Enabling and starting systemd service..."
systemctl daemon-reload
systemctl enable peopletracker.service
systemctl restart peopletracker.service

# --------------------------------------------------
# CREATE AUTO-UPDATE SCRIPT
# --------------------------------------------------

print_message "Creating update script..."
cat > "$UPDATE_SCRIPT" <<EOL
#!/bin/bash

# Configuration
PROJECT_DIR="$PROJECT_DIR"
VENV_DIR="$VENV_DIR"
BRANCH="$BRANCH"
LOG_FILE="$LOG_FILE"
GH_USER="$GH_USER"
GH_TOKEN="$GH_TOKEN"
GH_REPO_URL="$GH_REPO_URL"

exec >> "\$LOG_FILE" 2>&1

echo "--------------------------------------------------"
echo "Running update check at \$(date)"
echo "--------------------------------------------------"

cd "\$PROJECT_DIR"

# Ensure the remote URL includes credentials (in case they changed)
git remote set-url origin "https://\${GH_USER}:\${GH_TOKEN}@\${GH_REPO_URL}"

# Fetch updates
git fetch origin "\$BRANCH"

# Compare
LOCAL=\$(git rev-parse HEAD)
REMOTE=\$(git rev-parse origin/"\$BRANCH")

if [ "\$LOCAL" != "\$REMOTE" ]; then
  echo "Updates detected. Pulling changes..."
  
  # Hard reset to match remote
  git reset --hard origin/"\$BRANCH"
  
  # Re-install requirements
  "\$VENV_DIR/bin/pip" install -r requirements.txt
  
  echo "Update applied. Rebooting..."
  sudo reboot
else
  echo "System is up to date."
fi
EOL

# Fix permissions for the update script
chmod +x "$UPDATE_SCRIPT"
chown "$REAL_USER:$REAL_USER" "$UPDATE_SCRIPT"

# 8. Set up cron job (runs at 4:00 AM)
print_message "Setting up cron job..."
# We modify the user's crontab, not root's
sudo -u "$REAL_USER" bash -c "(crontab -l 2>/dev/null | grep -v '$UPDATE_SCRIPT'; echo '0 4 * * * /bin/bash $UPDATE_SCRIPT') | crontab -"

# 9. Final Success Message
print_message "Setup SUCCESS! The service is running."
print_message "The system will reboot in 5 seconds to ensure a clean state."
sleep 5
reboot