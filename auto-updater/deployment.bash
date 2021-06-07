#!/bin/bash
#
# Deploy auto-updater on a brandnew machine

sudo apt-get update
sudo apt-get dist-upgrade --yes

# "pthon3-venv" is required by "python -m venv" command;
# "r-base" is required when pip installs "rpy2" (in `requirements.txt`);
# "*-dev" are required by "pip install -r requirements.txt" command too.
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
