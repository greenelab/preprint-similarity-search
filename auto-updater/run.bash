#!/bin/bash

# Exit if any error happens
set -e

SCRIPT_DIR=$(dirname $(readlink -e $0))

# Upgrade OS packages
echo "$(date +"%F %X"): Upgrade OS packages"
sudo apt-get dist-upgrade --yes

# Update repo
cd ${SCRIPT_DIR}
echo -e "\n$(date +"%F %X"): Update local repo"
#git checkout master
git pull

# Create directory and symbolic links for current run
echo -e "\n$(date +"%F %X"): Creating directories for new run ..."
DATE_STR=$(date -I)
cd ${SCRIPT_DIR}/data/
mkdir -p ${DATE_STR}
ln -sf ${DATE_STR} current_run

# Go to current run's data dir and create sub-dirs
cd ${DATE_STR}
mkdir -p input output

# Create symbolic links as input files for current run
if [ ! -e ../last_run/output ]; then
    echo "Error: ouput files in last_run not found"
    exit 1
fi

LAST_OUTPUT_DIR=$(readlink -e ../last_run/output)
ln -sf ${LAST_OUTPUT_DIR}/embeddings_full.tsv ./input
ln -sf ${LAST_OUTPUT_DIR}/global_token_counts.tsv ./input
ln -sf ${LAST_OUTPUT_DIR}/pmc_oa_file_list.tsv ./input
ln -sf ${LAST_OUTPUT_DIR}/pmc_tsne_square.tsv ./input

# Run auto-updater's main module inside a virtual env
source $HOME/venv/auto-updater/bin/activate
cd ${SCRIPT_DIR}

echo -e "\n$(date +"%F %X"): Running main.py ..."

python3 ./main.py

# Back up some output files to Google Cloud bucket
echo "$(date +"%F %X"): Create output tarball file ..."
cd ${SCRIPT_DIR}/data/current_run
tar czvf ${DATE_STR}.tgz output/*.tsv output/*.json

echo "$(date +"%F %X"): Copy output tarball file to Google Cloud Bucket ..."
gsutil cp ${DATE_STR}.tgz gs://preprint-similarity-search/auto-updater/
rm -f ${DATE_STR}.tgz

# Copy deployment files to Google Cloud bucket
echo -e "\n$(date +"%F %X"): Copy deployment files to Google Cloud Bucket ..."
gsutil cp -r output/deployment gs://preprint-similarity-search/data_for_deployment/${DATE_STR}
echo ${DATE_STR} > remote_version.txt
gsutil cp remote_version.txt gs://preprint-similarity-search/data_for_deployment/
rm -f remote_version.txt

# Reset symbolic links
cd ${SCRIPT_DIR}/data
rm -f last_run current_run
ln -s ${DATE_STR} last_run

# Delete data files that are older than two months
echo -e "\n$(date +"%F %X"): Clean up old files"
find ${SCRIPT_DIR}/data/ -type d -name "20*" -ctime +60 | xargs rm -rf

# Shut down itself
echo -e "\n$(date +"%F %X"): Done\n"
sudo init 0
