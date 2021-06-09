#!/bin/bash
#
# Deploy auto-updater on a brandnew Debian/Ubuntu box

sudo apt-get update
sudo apt-get dist-upgrade --yes

# "pthon3-venv" is required by "python -m venv" command;
# "r-base" is required by "rpy2" package in `requirements.txt`;
# "*-dev" are required when compiling some packages in `requirements.txt`.
sudo apt-get install python3-venv r-base python3-dev libxml2-dev libxslt-dev --yes

mkdir ~/venv
python3 -m venv ~/venv/auto-updater
source ~/venv/auto-updater/bin/activate

cd ~
git clone https://github.com/greenelab/preprint-similarity-search.git
cd ~/preprint-similarity-search/server
git submodule update --init

# If the PR `https://github.com/KrishnaswamyLab/SAUCIE/pull/38` hasn't
# been merged, please change the following line in `SAUCIE/utils.py`:
#     import tensorflow as tf
# into:
#     import tensorflow as tf
#     if not tf.__version__.startswith("1."):
#         import tensorflow.compat.v1 as tf
#         tf.disable_eager_execution()

cd ~/preprint-similarity-search/auto-updater
pip install wheel
pip install -r requirements.txt

# Install 'ggplot2' and its dependency R packages in '/usr/local/lib/R/site-library/'
# (required by `auto-updater/get_square_bins.R`)
sudo su - -c "R -e \"install.packages('ggplot2')\""

# Install 'en-core-web-sm' pip package in venv
python -m spacy download en_core_web_sm

# Copy static data files from Google bucket
mkdir ~/preprint-similarity-search/auto-updater/data
cd ~/preprint-similarity-search/auto-updater/data
gsutil cp -r gs://preprint-similarity-search/server_data/static .

# Copy the data of last run from Google Cloud Bucket
gsutil cp -r gs://preprint-similarity-search/auto-updater/server_data/version.txt .
last_run_date=$(cat version.txt)
mkdir ${last_run_date}
rm -f version.txt
cd ${last_run_date}
gsutil cp -r gs://preprint-similarity-search/auto-updater/${last_run_date}.tgz .
tar xzvf ${last_run_date}.tgz

# Build "last_run" symbolic link
cd ..
ln -sf ${last_run_date} last_run
