#!/bin/bash
#
# Start auto-updater VM, which will do the heavy lifting.

set -e

echo -e "\n$(date +"%F %X"): Start auto-updater VM"

gcloud compute instances start auto-updater --zone=us-east1-b

echo -e "\n$(date +"%F %X"): auto-updater VM started\n"
