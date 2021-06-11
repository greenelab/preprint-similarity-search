#!/bin/bash
#
# Upgrade the OS and pip packages before running auto-updater process.

# Exit immediately if any error happens
set -e

# Make `gcloud` and `gsutil` commands available when run as a cron job
PATH=/snap/bin:$PATH

SCRIPT_DIR=$(dirname $(readlink -e $0))
cd ${SCRIPT_DIR}

# Update the repo
echo -e "$(date +"%F %X"): Update local repo"
git pull; echo

# Activate venv and check whether `requirements.txt` is updated.
# If yes, run `pip install` to update venv
source $HOME/venv/auto-updater/bin/activate
find . -mmin -3 | grep requirements.txt > /dev/null
if [ "$?" -eq 0 ]; then
    echo -e "$(date +"%F %X"): Update venv"
    pip install -r requirements.txt
fi

# Upgrade OS packages
echo -e "\n$(date +"%F %X"): Upgrade OS packages"
sudo apt-get update --quiet
sudo DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade --quiet --yes
sudo DEBIAN_FRONTEND=noninteractive apt-get autoremove

# Reboot if required
if [ -f /var/run/reboot-required ]; then
    echo -e "\n$(date +"%F %X"): Reboot auto-updater\n"
    /sbin/reboot
else
    echo -e "\n$(date +"%F %X"): OS and venv upgrade is done\n"
fi
