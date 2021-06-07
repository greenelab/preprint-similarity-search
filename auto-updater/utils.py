"""Utility functions."""

from datetime import datetime
import os
from stat import S_IREAD, S_IRGRP, S_IROTH


def set_read_only(filename):
    """Set input file to read-only."""

    permission = S_IREAD | S_IRGRP | S_IROTH
    os.chmod(filename, permission)


def updater_log(message, with_date=True, prefix_blank_line=False):
    """Print a log message with optional datetime prefix."""

    # Print a blank line as a divider at the very beginning
    if prefix_blank_line:
        print(flush=True)

    if with_date:
        message = f"{datetime.now()}: {message}"

    print(message, flush=True)
