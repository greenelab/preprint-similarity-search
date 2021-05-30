#!/bin/bash

# Exit if any error happens
set -e

SCRIPT_DIR=$(dirname $(readlink -e $0))

# Create directory and symbolic links for current run
DATE_STR=$(date -I)
CURR_DATA_DIR=${SCRIPT_DIR}/data/${DATE_STR}
mkdir -p ${CURR_DATA_DIR}
ln -sf ${DATE_STR} current_run

# Go to current run's data dir and create sub-dirs
cd ${CURR_DATA_DIR}
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
source $HOME/venv/pss-updater/bin/activate
cd ${SCRIPT_DIR}
python3 ./main.py
