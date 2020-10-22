#!/bin/bash
#
# IMPORTANT: This script should be launched by a regular user account
# on Ubuntu/Debian box WITHOUT "sudo" prefix.

# ========================================================================
#          Run this section as regular user:
# ========================================================================

# (1) Clone the repository and submodule
cd $HOME
git clone https://github.com/greenelab/annorxiver-journal-recommender.git
cd annorxiver-journal-recommender/server
git submodule update --init

# (2) Copy data files from AWS S3 to local `server/data/` directory
mkdir data
aws s3 cp --recursive s3://journal-rec-app/data_for_deployment ./data

# (3) Set up virtualenv
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements.txt

# =============================================================================
#        The following section needs `sudo` privilege:
# =============================================================================

cd deployment/
sudo apt update

# (1) Install `certbot` to manage SSL certificates,
EMAIL="team@greenelab.com"
DOMAIN_NAME="api-journal-rec.greenelab.com"

sudo apt install certbot python-certbot-nginx -y
sudo certbot certonly --nginx --noninteractive --no-eff-email --agree-tos \
     --email $EMAIL --domains ${DOMAIN_NAME}

# (2) Set up `supervisor` to manage a Gunicorn process that starts Flask app
sudo apt install supervisor -y
sudo cp supervisor.conf /etc/supervisor/conf.d/
sudo systemctl restart supervisor  # restart supervisor

# (3) Set up Nginx web server
sudo apt install nginx -y
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp nginx.conf /etc/nginx/sites-available/journal_rec_app.conf
sudo ln -s /etc/nginx/sites-available/journal_rec_app.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx  # restart nginx
