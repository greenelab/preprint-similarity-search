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
git pull

# If `requirements.txt` is updated, run `pip install`
find . -mmin -3 | grep requirements.txt > /dev/null && pip install -r requirements.txt

# Upgrade OS packages
echo "$(date +"%F %X"): Upgrade OS packages"
sudo apt-get update --quiet
sudo apt-get dist-upgrade --quiet --yes

# Reboot if required
if [ -f /var/run/reboot-required ]; then
    echo -e "\n$(date +"%F %X"): Reboot auto-updater\n"
    /sbin/reboot
fi
