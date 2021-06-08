#!/bin/bash

set -e

# Stop "auto-updater" VM instance (if it still runs)
gcloud compute instances stop auto-updater --zone=us-east1-b

# Compare remote and local versions
cd ~/preprint-similarity-search/server/data
gsutil cp gs://preprint-similarity-search/data_for_deployment/remote_version.txt .

local_version=$(cat local_version.txt)
remote_version=$(cat remote_version.txt)

# Update local version
if [[ "${remote_version}" > "${local_version}" ]]; then
    gsutil cp gs://preprint-similarity-search/data_for_deployment/${remote_version}/* .

    # Restart backend API server
    sudo systemctl restart supervisor

    # Overwrite "plot.json" on master branch
    git checkout master
    mv -f plot.json ~/preprint-similarity-search/frontend/public/data/

    # Push the updated to master branch, which will trigger the frontend rebuild
    git add  ~/preprint-similarity-search/frontend/public/data/plot.json
    git ci -m "Update plot.json"
    git push

    # Keep track of local version number
    mv remote_version.txt local_version.txt
fi
