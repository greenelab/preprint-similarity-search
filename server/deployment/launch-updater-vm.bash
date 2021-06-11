#!/bin/bash
#
# Start auto-updater VM, which will do the heavy lifting.

# Exit immediately if any error happens
set -e

echo -e "$(date +"%F %X"): Start auto-updater VM"

# Make `gcloud` and `gsutil` commands available when run as a cron job
PATH=/snap/bin:$PATH

gcloud compute instances start auto-updater --zone=us-east1-b

echo -e "\n$(date +"%F %X"): auto-updater VM started\n"
