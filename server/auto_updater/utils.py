"""Utility functions."""

from datetime import datetime
import os
from stat import S_IREAD, S_IRGRP, S_IROTH


def updater_log(message, with_date=True):
    """Print a log message with optional datetime prefix."""

    if with_date:
        message = f"{datetime.now()}: {message}"

    print(message, flush=True)


def set_read_only(filename):
    """Set input file to read-only."""

    permission = S_IREAD | S_IRGRP | S_IROTH
    os.chmod(filename, permission)
