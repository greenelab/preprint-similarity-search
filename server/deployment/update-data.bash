#!/bin/bash
#
# Stop "auto-updater" VM and collect updated data for both backend and frontend.
# If updates are available, restart backend and rebuild frontend.

# Exit immediately if any error happens
set -e

echo "$(date +"%F %X"): Stop auto-updater VM instance"

# Make `gcloud` and `gsutil` commands available when run as a cron job
PATH=/snap/bin:$PATH

# Current status of "auto-updater" VM (for curiosity only):
gcloud compute instances list --filter="name=auto-updater"

# Stop the VM (not hurt if it's already offline)
gcloud compute instances stop auto-updater --zone=us-east1-b

# Main working directory
cd ~/preprint-similarity-search/server/data

# Compare remote and local versions
echo -e "\n$(date +"%F %X"): Check remote version"
gsutil -q cp gs://preprint-similarity-search/server_data/version.txt ./remote_version.txt

local_version=$(cat version.txt)
remote_version=$(cat remote_version.txt)

# Update local version
if [[ "${remote_version}" > "${local_version}" ]]; then
    echo -e "\n$(date +"%F %X"): Copy updated data from Google Cloud bucket"
    gsutil -q cp gs://preprint-similarity-search/server_data/${remote_version}/* .

    # Restart backend API server
    echo -e "\n$(date +"%F %X"): Restart backend"
    sudo systemctl restart supervisor

    # Overwrite "plot.json" on master branch
    git checkout master
    mv -f plot.json ~/preprint-similarity-search/frontend/public/data/

    # Push the updated 'plot.json' to master branch, which will trigger
    # the git action in this repo to rebuild the frontend
    echo -e "\n$(date +"%F %X"): Push updated plot.json"
    git add  ~/preprint-similarity-search/frontend/public/data/plot.json
    git ci -m "Update plot.json"
    git push

    # Update local version number
    mv remote_version.txt version.txt
    echo -e "\n$(date +"%F %X"): updated successfully\n"
else
    rm -f remote_version.txt
    echo -e "\n$(date +"%F %X"): no need to update\n"
fi
