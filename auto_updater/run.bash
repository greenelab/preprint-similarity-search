#!/bin/bash

# Exit if any error happens
set -e

SCRIPT_DIR=$(dirname $(readlink -e $0))

# Create directory and symbolic links for current run
echo "$(date): Creating directories for new run ..."
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

# Run auto-updater's main module inside a virtual env
source $HOME/venv/pss/bin/activate
cd ${SCRIPT_DIR}

echo "$(date): Running main.py ..."

python3 ./main.py

# Copy deployment files to Google Cloud bucket


# Delete data files that are older than two months
find ${SCRIPT_DIR}/data/ -type d -name "20*" -ctime +60 | xargs rm -rf

echo "$(date): Done"
