#!/bin/bash
#
# Start auto-updater VM, which will do the heavy lifting.

set -e

gcloud compute instances start auto-updater --zone=us-east1-b
