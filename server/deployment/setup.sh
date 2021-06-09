#!/bin/bash
#
# IMPORTANT: This script should be launched by a regular user account
# on Ubuntu/Debian box WITHOUT "sudo" prefix.

# ========================================================================
#          Run this section as regular user:
# ========================================================================

# (1) Clone the repository and submodule
cd $HOME
git clone https://github.com/greenelab/preprint-similarity-search.git
cd preprint-similarity-search/server
git submodule update --init

# If the PR `https://github.com/KrishnaswamyLab/SAUCIE/pull/38` hasn't
# been merged, please change the following line in `SAUCIE/utils.py`:
#     import tensorflow as tf
# into:
#     import tensorflow as tf
#     if not tf.__version__.startswith("1."):
#         import tensorflow.compat.v1 as tf
#         tf.disable_eager_execution()

# (2) Copy data files from Google Cloud Storage bucket to local `server/data/` directory
mkdir data
cd data
gsutil cp -r gs://preprint-similarity-search/server_data/version.txt ./
version=$(cat $version.txt)

gsutil cp -r gs://preprint-similarity-search/server_data/${version}/* ./
gsutil cp -r gs://preprint-similarity-search/server_data/static/word_model.wv.pkl ./

# Remove 'plot.json', which is for frontend only
rm -f ./plot.json

# (3) Set up virtualenv
python3 -m venv ~/venv
source ~/venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# =============================================================================
#        The following section needs `sudo` privilege:
# =============================================================================

cd ../deployment/
sudo apt update

# (1) Install `certbot` to manage SSL certificates,
EMAIL="team@greenelab.com"
DOMAIN_NAME="api-pss.greenelab.com"

sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx --noninteractive --no-eff-email --agree-tos \
     --email $EMAIL --domains ${DOMAIN_NAME}

# (2) Set up `supervisor` to manage a Gunicorn process that starts Flask app
sudo apt install supervisor -y
sudo cp supervisor.conf /etc/supervisor/conf.d/gunicorn.conf
sudo systemctl restart supervisor  # restart supervisor

# (3) Set up Nginx web server
sudo apt install nginx -y
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp nginx.conf /etc/nginx/sites-available/preprint-similarity-search.conf
sudo ln -s /etc/nginx/sites-available/preprint-similarity-search.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx  # restart nginx
