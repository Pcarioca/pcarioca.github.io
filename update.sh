#!/bin/bash

# ==========================================
# CONFIGURATION
# ==========================================
# Detect the actual user even if running with sudo
if [ -n "$SUDO_USER" ]; then
    ACTUAL_USER="$SUDO_USER"
else
    ACTUAL_USER=$(whoami)
fi

# Configuration Variables
HOME_DIR="/home/$ACTUAL_USER"
PROJECT_DIR="$HOME_DIR/PeopleTrackerDepthAI"
REPO_OWNER="SbSoftwareSrl"
REPO_NAME="PeopleTrackerDepthAI"
BRANCH_NAME="beta_test"  # <--- TARGET BRANCH
GITHUB_TOKEN="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"
GITHUB_URL="https://${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git"

VENV_DIR="$PROJECT_DIR/venv"
SERVICE_NAME="peopletracker.service"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME"
UPDATE_SCRIPT="$HOME_DIR/daily_update.sh"
LOG_FILE="$HOME_DIR/update_job.log"

# Function to print messages
print_message() {
  echo "--------------------------------------------------"
  echo "$1"
  echo "--------------------------------------------------"
}

# ==========================================
# 1. PREPARATION
# ==========================================

# Ensure we are running with sudo for system modifications
if [ "$EUID" -ne 0 ]; then 
  print_message "Please run as root (sudo)"
  exit 1
fi

print_message "Configuring for User: $ACTUAL_USER"
print_message "Home Directory: $HOME_DIR"

# Clean up existing project if it exists (Optional: careful with this!)
if [ -d "$PROJECT_DIR" ]; then
    print_message "Removing existing project directory..."
    rm -rf "$PROJECT_DIR"
fi

# ==========================================
# 2. CLONE REPOSITORY
# ==========================================

print_message "Cloning repository (branch: $BRANCH_NAME)..."

# switch to user home
cd "$HOME_DIR" || exit 1

# Clone specific branch
git clone -b "$BRANCH_NAME" "$GITHUB_URL"

# Fix permissions because we are running as root
chown -R "$ACTUAL_USER:$ACTUAL_USER" "$PROJECT_DIR"

if [ ! -d "$PROJECT_DIR" ]; then
  print_message "Failed to clone repository. Check token/internet."
  exit 1
fi

cd "$PROJECT_DIR" || exit 1

# ==========================================
# 3. PYTHON ENVIRONMENT
# ==========================================

print_message "Creating virtual environment..."
# Run as the actual user, not root, to avoid permission issues later
sudo -u "$ACTUAL_USER" python3 -m venv "$VENV_DIR"

print_message "Installing requirements..."
sudo -u "$ACTUAL_USER" "$VENV_DIR/bin/pip" install -r requirements.txt

# ==========================================
# 4. SYSTEMD SERVICE
# ==========================================

print_message "Creating systemd service file..."

cat > "$SERVICE_FILE" <<EOL
[Unit]
Description=PeopleTrackerDepthAI Service (Branch: $BRANCH_NAME)
After=network.target

[Service]
User=$ACTUAL_USER
WorkingDirectory=$PROJECT_DIR
# Run via the venv python
ExecStart=/usr/bin/sudo $VENV_DIR/bin/python $PROJECT_DIR/launch.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

print_message "Enabling and starting systemd service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# ==========================================
# 5. UPDATE SCRIPT (Daily Cron)
# ==========================================

print_message "Creating daily update script..."

cat > "$UPDATE_SCRIPT" <<EOL
#!/bin/bash

# Hardcoded variables for the cron job
PROJECT_DIR="$PROJECT_DIR"
VENV_DIR="$VENV_DIR"
LOG_FILE="$LOG_FILE"
BRANCH="$BRANCH_NAME"

echo "[\$(date)] Starting Update Check for branch: \$BRANCH" >> "\$LOG_FILE"

cd "\$PROJECT_DIR" || exit 1

# Fetch latest info from remote
git fetch origin "\$BRANCH" >> "\$LOG_FILE" 2>&1

LOCAL=\$(git rev-parse HEAD)
REMOTE=\$(git rev-parse "origin/\$BRANCH")

if [ "\$LOCAL" != "\$REMOTE" ]; then
  echo "[\$(date)] Updates detected. Pulling..." >> "\$LOG_FILE"
  
  # Hard reset to match remote branch exactly
  git reset --hard "origin/\$BRANCH" >> "\$LOG_FILE" 2>&1
  
  # Re-install requirements in case they changed
  "\$VENV_DIR/bin/pip" install -r requirements.txt >> "\$LOG_FILE" 2>&1
  
  echo "[\$(date)] Update complete. Rebooting system..." >> "\$LOG_FILE"
  
  # Reboot to apply changes safely
  sudo /sbin/reboot
else
  echo "[\$(date)] No updates found." >> "\$LOG_FILE"
fi
EOL

# Make executable and correct owner
chmod +x "$UPDATE_SCRIPT"
chown "$ACTUAL_USER:$ACTUAL_USER" "$UPDATE_SCRIPT"

# ==========================================
# 6. CRON JOB
# ==========================================

print_message "Setting up cron job (Runs at 4:00 AM)..."

# We add the cron job to root's crontab so it has permission to reboot
# BUT we run the script logic mostly as root (except git reset usually works better if owned by user, but root can force it)

CRON_CMD="0 4 * * * $UPDATE_SCRIPT"

# Check if job already exists to avoid duplicates
(crontab -l 2>/dev/null | grep -F "$UPDATE_SCRIPT") || (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

print_message "Setup Complete! System will now reboot to finalize."
sleep 3
reboot