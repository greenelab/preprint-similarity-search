#!/bin/bash

# Installs `certbot` to manage SSL certificates, sets up `supervisor` to manage
# the Gunicorn process that starts Flask web app, and sets up Nginx web server.

EMAIL="team@greenelab.com"
DOMAIN_NAME="api-journal-rec.greenelab.com"

sudo apt update

# (1) certbot
sudo apt install certbot python-certbot-nginx -y
sudo certbot certonly --nginx --noninteractive --no-eff-email --agree-tos \
     --email $EMAIL --domains ${DOMAIN_NAME}

# (2) supervisor
sudo apt install supervisor -y
sudo cp supervisor.conf /etc/supervisor/conf.d/
sudo systemctl restart supervisor  # restart supervisor

# (3) Nginx
sudo apt install nginx -y
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp nginx.conf /etc/nginx/sites-available/journal_rec_app.conf
sudo ln -s /etc/nginx/sites-available/journal_rec_app.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx  # restart nginx
