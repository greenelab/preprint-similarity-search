#!/bin/bash

set -e

# Stop "auto-updater" VM instance (if it still runs)
echo "$(date +"%F %X"): Stop auto-updater VM instance"
gcloud compute instances stop auto-updater --zone=us-east1-b

cd ~/preprint-similarity-search/server/data

# Compare remote and local versions
echo "$(date +"%F %X"): Check remote version"
gsutil cp gs://preprint-similarity-search/data_for_deployment/remote_version.txt .

local_version=$(cat local_version.txt)
remote_version=$(cat remote_version.txt)

# Update local version
if [[ "${remote_version}" > "${local_version}" ]]; then
    echo -e "\n$(date +"%F %X"): Copy updated deployment files from Google Cloud bucket"
    gsutil cp gs://preprint-similarity-search/data_for_deployment/${remote_version}/* .

    # Restart backend API server
    echo -e "\n$(date +"%F %X"): Restart backend"
    sudo systemctl restart supervisor

    # Overwrite "plot.json" on master branch
    git checkout master
    mv -f plot.json ~/preprint-similarity-search/frontend/public/data/

    # Push the updated to master branch, which will trigger the frontend rebuild
    echo -e "\n$(date +"%F %X"): Commit updated plot.json"
    git add  ~/preprint-similarity-search/frontend/public/data/plot.json
    git ci -m "Update plot.json"
    git push

    # Keep track of local version number
    mv remote_version.txt local_version.txt

    echo -e "\n$(date +"%F %X"): updated successfully"
else
    echo -e "\n$(date +"%F %X"): no need to update"
fi