#!/usr/bin/env python3

"""
Download XML tarball files from NCBI website.
"""

from contextlib import closing
import os
from pathlib import Path
import shutil
import urllib.request as request

from utils import set_read_only, updater_log

pmc_open_access_url = "ftp://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_bulk/"


def ftp_download(url, destination):
    """
    Download a single file that's hosted on an FTP server.
    Code is based on: https://stackoverflow.com/questions/11768214/
    """

    updater_log(f"Downloading {url} ...")
    with closing(request.urlopen(url)) as resp, open(destination, 'wb') as fh:
            shutil.copyfileobj(resp, fh)


def download_xml_files(download_dir):
    """
    Download all *.xml.tar.gz" files from NCBI FTP server.
    """

    # Grab file list on ftp server
    response = request.urlopen(f"{pmc_open_access_url}")
    files = response.read().decode("utf-8").splitlines()
    tar_files = [
        f.split(" ")[-1] for f in files if f.endswith(".xml.tar.gz")
    ]

    for f in tar_files:
        url = pmc_open_access_url + f
        destination = Path(download_dir, f)
        ftp_download(url, destination)
        set_read_only(destination)  # set downloaded file read-only


# Test harness
if __name__ == '__main__':
    download_dir = '/tmp/xml-tarball'
    download_xml_files(download_dir)
